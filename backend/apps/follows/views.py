from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Follow
from .serializers import FollowStatusSerializer, FollowerUserSerializer
from apps.posts.models import Post
from apps.posts.serializers import PostSerializer


class FollowToggleView(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, username):
        target_user = get_object_or_404(User, username=username)
        is_following = False
        if request.user.is_authenticated:
            is_following = Follow.objects.filter(follower=request.user, following=target_user).exists()
        return Response(
            {
                "is_following": is_following,
                "followers_count": target_user.followers_set.count(),
                "following_count": target_user.following_set.count(),
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)

        if request.user == target_user:
            return Response(
                {"detail": "Өзүңүзгө жазыла албайсыз."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=target_user,
        )

        if not created:
            follow.delete()
            is_following = False
        else:
            is_following = True
            from apps.notifications.utils import create_notification
            create_notification(recipient=target_user, sender=request.user, notification_type="follow")


        return Response(
            {
                "is_following": is_following,
                "followers_count": target_user.followers_set.count(),
                "following_count": target_user.following_set.count(),
            },
            status=status.HTTP_200_OK,
        )


class FollowersListView(generics.ListAPIView):
    """
    Колдонуучунун катталуучулар (followers) тизмеси.
    """
    serializer_class = FollowerUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        follower_ids = user.followers_set.values_list("follower_id", flat=True)
        return User.objects.filter(id__in=follower_ids).select_related("profile")


class FollowingListView(generics.ListAPIView):
    """
    Колдонуучу жазылган адамдардын (following) тизмеси.
    """
    serializer_class = FollowerUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        following_ids = user.following_set.values_list("following_id", flat=True)
        return User.objects.filter(id__in=following_ids).select_related("profile")


class FeedView(generics.ListAPIView):
    """
    Жекелештирилген лента (Feed).
    Учурдагы колдонуучунун өзүнүн жана ал жазылган адамдардын посттору.
    Жаңысынан эскисине карай сорттолот.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        following_ids = user.following_set.values_list("following_id", flat=True)
        return (
            Post.objects.filter(Q(author=user) | Q(author_id__in=following_ids))
            .select_related("author", "author__profile")
            .prefetch_related("likes", "comments")
            .order_by("-created_at")
        )
