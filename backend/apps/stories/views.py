from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models import Q, Exists, OuterRef
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Story, StoryView
from .serializers import StorySerializer, StoryCreateSerializer


class StoryFeedView(APIView):
    """
    Башкы лентадагы тарыхтар тасмасы.
    Колдонуучу боюнча топтолгон активдүү (24 сааттан өтпөгөн) тарыхтар.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        active_stories = (
            Story.objects.filter(expires_at__gt=now)
            .select_related("author", "author__profile")
            .prefetch_related("views")
            .order_by("author", "-created_at")
        )

        # Колдонуучулар боюнча топтоо
        user_groups = {}
        for story in active_stories:
            uid = story.author.id
            if uid not in user_groups:
                avatar = None
                if hasattr(story.author, "profile") and story.author.profile.avatar:
                    avatar = story.author.profile.avatar.url
                user_groups[uid] = {
                    "user_id": uid,
                    "username": story.author.username,
                    "avatar": avatar,
                    "stories": [],
                    "has_unviewed": False,
                }
            serialized = StorySerializer(story, context={"request": request}).data
            user_groups[uid]["stories"].append(serialized)
            if not story.views.filter(viewer=request.user).exists():
                user_groups[uid]["has_unviewed"] = True

        # Өзүнүн тарыхтары биринчи, калгандары has_unviewed боюнча
        result = sorted(
            user_groups.values(),
            key=lambda g: (g["user_id"] != request.user.id, not g["has_unviewed"]),
        )
        return Response(result, status=status.HTTP_200_OK)


class StoryCreateView(APIView):
    """
    Жаңы тарых жарыялоо.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        story = serializer.save(author=request.user)
        output = StorySerializer(story, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class StoryViewRegisterView(APIView):
    """
    Тарыхты көрүүнү каттоо (view).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, story_id):
        try:
            story = Story.objects.get(id=story_id)
        except Story.DoesNotExist:
            return Response({"detail": "Тарых табылган жок."}, status=status.HTTP_404_NOT_FOUND)

        if story.author != request.user:
            StoryView.objects.get_or_create(story=story, viewer=request.user)

        return Response({"status": "viewed"}, status=status.HTTP_200_OK)


class StoryDeleteView(APIView):
    """
    Өзүнүн тарыхын өчүрүү.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, story_id):
        try:
            story = Story.objects.get(id=story_id, author=request.user)
        except Story.DoesNotExist:
            return Response({"detail": "Тарых табылган жок."}, status=status.HTTP_404_NOT_FOUND)
        story.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
