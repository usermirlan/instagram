from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Count, Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationListCreateView(APIView):
    """
    Колдонуучунун бардык диалогдорун алуу же жаңы диалог баштоо.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        conversations = request.user.conversations.prefetch_related(
            "participants", "messages", "participants__profile"
        ).order_by("-updated_at")
        serializer = ConversationSerializer(conversations, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        target_username = request.data.get("username")
        if not target_username:
            return Response(
                {"detail": "username көрсөтүлүшү керек."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if target_username == request.user.username:
            return Response(
                {"detail": "Өзүңүз менен диалог ача албайсыз."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user = get_object_or_404(User, username=target_username)

        # Эки колдонуучу катышкан бар болгон диалогду табуу
        conversation = (
            Conversation.objects.filter(participants=request.user)
            .filter(participants=target_user)
            .first()
        )

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, target_user)

        serializer = ConversationSerializer(conversation, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageListCreateView(APIView):
    """
    Диалогдогу билдирүүлөрдү алуу жана жаңы билдирүү жөнөтүү.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        if not conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {"detail": "Бул диалогго кирүүгө укугуңуз жок."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Башка колдонуучудан келген окула элек билдирүүлөрдү "окулду" кылуу
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

        messages = conversation.messages.select_related("sender", "sender__profile").order_by("created_at")
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)

        if not conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {"detail": "Бул диалогго билдирүү жөнөтүүгө укугуңуз жок."},
                status=status.HTTP_403_FORBIDDEN,
            )

        text = request.data.get("text", "").strip()
        image = request.FILES.get("image")
        audio = request.FILES.get("audio")

        if not text and not image and not audio:
            return Response(
                {"detail": "Билдирүү тексти же медиа файлы көрсөтүлүшү керек."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            text=text,
            image=image,
            audio=audio,
        )
        # Диалогдун updated_at убактысын жаңыртуу
        conversation.save()

        from apps.notifications.utils import create_notification
        for participant in conversation.participants.exclude(id=request.user.id):
            create_notification(recipient=participant, sender=request.user, notification_type="message")

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnreadMessageCountView(APIView):
    """
    Колдонуучунун бардык окула элек жеке билдирүүлөрүнүн жалпы саны.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False,
        ).exclude(sender=request.user).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
