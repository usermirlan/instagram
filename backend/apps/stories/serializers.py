from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Story, StoryView


class StorySerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    views_count = serializers.IntegerField(read_only=True, default=0)
    is_viewed = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = [
            "id", "author", "media", "media_type", "caption",
            "created_at", "expires_at", "views_count", "is_viewed",
        ]
        read_only_fields = ["id", "author", "created_at", "expires_at", "views_count", "is_viewed"]

    def get_author(self, obj):
        avatar = None
        if hasattr(obj.author, "profile") and obj.author.profile.avatar:
            avatar = obj.author.profile.avatar.url
        return {
            "id": obj.author.id,
            "username": obj.author.username,
            "avatar": avatar,
        }

    def get_is_viewed(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.views.filter(viewer=request.user).exists()
        return False


class StoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = ["id", "media", "media_type", "caption"]

    def validate_media(self, value):
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("Файлдын өлчөмү 10MB'тан ашпашы керек.")
        return value


class StoryGroupSerializer(serializers.Serializer):
    """
    Колдонуучу боюнча тарыхтарды топтоо (stories bar үчүн).
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    avatar = serializers.CharField(allow_null=True)
    stories = StorySerializer(many=True)
    has_unviewed = serializers.BooleanField()
