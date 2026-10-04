from rest_framework import serializers
from .models import Post, Like, Comment
from apps.accounts.serializers import UserSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "post", "author", "parent", "text", "created_at", "is_author"]
        read_only_fields = ["id", "author", "post", "created_at", "is_author"]

    def get_author(self, obj):
        avatar = obj.author.profile.avatar.url if hasattr(obj.author, "profile") and obj.author.profile.avatar else None
        return {
            "id": obj.author.id,
            "username": obj.author.username,
            "avatar": avatar,
        }

    def get_is_author(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    comments_count = serializers.IntegerField(source="comments.count", read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "image",
            "caption",
            "created_at",
            "updated_at",
            "likes_count",
            "comments_count",
            "is_liked",
            "is_author",
        ]
        read_only_fields = ["id", "author", "created_at", "updated_at", "likes_count", "comments_count", "is_liked", "is_author"]

    def get_author(self, obj):
        avatar = obj.author.profile.avatar.url if hasattr(obj.author, "profile") and obj.author.profile.avatar else None
        return {
            "id": obj.author.id,
            "username": obj.author.username,
            "name": f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username,
            "avatar": avatar,
        }

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_is_author(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.author == request.user
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "image", "caption"]

    def validate_image(self, value):
        # 5MB максималдуу өлчөм
        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("Сүрөттүн өлчөмү 5MB'тан ашпашы керек.")

        valid_extensions = ["jpg", "jpeg", "png", "webp", "gif"]
        ext = value.name.split(".")[-1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError(f"Колдоого алынбаган формат. Уруксат берилгендер: {', '.join(valid_extensions)}")

        return value
