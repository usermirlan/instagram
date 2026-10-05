from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.ReadOnlyField(source="sender.id")
    sender_username = serializers.ReadOnlyField(source="sender.username")
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender_id",
            "sender_username",
            "sender_avatar",
            "text",
            "image",
            "audio",
            "is_read",
            "created_at",
        ]
        read_only_fields = ["id", "conversation", "sender_id", "sender_username", "created_at"]

    def get_sender_avatar(self, obj):
        if hasattr(obj.sender, "profile") and obj.sender.profile.avatar:
            return obj.sender.profile.avatar.url
        return None


class ConversationParticipantSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "avatar"]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class ConversationSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "other_user", "last_message", "unread_count", "updated_at"]

    def get_other_user(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        other = obj.participants.exclude(id=request.user.id).first()
        if other:
            return ConversationParticipantSerializer(other, context=self.context).data
        return None

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by("-created_at").first()
        if last_msg:
            return {
                "id": last_msg.id,
                "text": last_msg.text,
                "sender_username": last_msg.sender.username,
                "created_at": last_msg.created_at,
                "is_read": last_msg.is_read,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
