from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Notification


class NotificationSenderSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "avatar"]

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class NotificationSerializer(serializers.ModelSerializer):
    sender = NotificationSenderSerializer(read_only=True)
    post_image = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "sender",
            "notification_type",
            "post",
            "post_image",
            "is_read",
            "created_at",
        ]

    def get_post_image(self, obj):
        if obj.post and obj.post.image:
            return obj.post.image.url
        return None
