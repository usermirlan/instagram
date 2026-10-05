from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post, Like, Comment
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer
from .permissions import IsAuthorOrReadOnly


class PostListCreateView(generics.ListCreateAPIView):
    """
    Бардык посттордун тизмеси жана жаңы пост жарыялоо.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Post.objects.select_related("author", "author__profile").prefetch_related("likes", "comments").all()
        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(caption__icontains=q)
        return qs

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PostCreateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        post = serializer.instance

        # Бир нече сүрөт жүктөлгөн болсо (карусель)
        images = request.FILES.getlist("images")
        if images:
            for idx, img in enumerate(images):
                from .models import PostImage
                PostImage.objects.create(post=post, image=img, order=idx)
                # Биринчи сүрөттү негизги сүрөт кылып коюу (эгер негизги сүрөт бош болсо)
                if idx == 0 and not post.image:
                    post.image = img
                    post.save(update_fields=["image"])

        output_serializer = PostSerializer(post, context={"request": request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Постту көрүү, түзөтүү же өчүрүү (автор гана өчүрө/оңдой алат).
    """
    queryset = Post.objects.select_related("author", "author__profile").prefetch_related("likes", "comments").all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]


class UserPostsListView(generics.ListAPIView):
    """
    Белгилүү бир колдонуучунун постторунун тизмеси (профиль баракчасы үчүн).
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get("username")
        user = get_object_or_404(User, username=username)
        return Post.objects.filter(author=user).select_related("author", "author__profile").prefetch_related("likes", "comments")


class PostLikeToggleView(APIView):
    """
    Постко лайк басуу же кайтарып алуу (Toggle).
    Бир сурам менен лайк кошулат же өчүрүлөт, жана учурдагы лайк саны кайтарылат.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:
            # Мурун лайк басылган болсо — өчүрөбүз (unlike)
            like.delete()
            is_liked = False
        else:
            is_liked = True
            from apps.notifications.utils import create_notification
            create_notification(recipient=post.author, sender=request.user, notification_type="like", post=post)

        return Response(
            {
                "liked": is_liked,
                "likes_count": post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )


class CommentListCreateView(generics.ListCreateAPIView):
    """
    Посттун комментарийлерин көрүү жана жаңы комментарий калтыруу.
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs.get("post_id")
        return Comment.objects.filter(post_id=post_id, parent=None).select_related("author", "author__profile").prefetch_related("replies")

    def perform_create(self, serializer):
        post_id = self.kwargs.get("post_id")
        post = get_object_or_404(Post, id=post_id)
        serializer.save(author=self.request.user, post=post)
        from apps.notifications.utils import create_notification
        create_notification(recipient=post.author, sender=self.request.user, notification_type="comment", post=post)



class CommentDeleteView(generics.DestroyAPIView):
    """
    Комментарийди өчүрүү (автор гана өчүрө алат).
    """
    queryset = Comment.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]


class BookmarkToggleView(APIView):
    """
    Постту сактоо же сакталгандардан өчүрүү (Bookmark / Save Toggle).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        from .models import Bookmark
        post = get_object_or_404(Post, id=post_id)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)

        if not created:
            bookmark.delete()
            is_saved = False
        else:
            is_saved = True

        return Response(
            {
                "is_saved": is_saved,
                "detail": "Пост сакталды" if is_saved else "Пост сакталгандардан өчүрүлдү",
            },
            status=status.HTTP_200_OK,
        )


class SavedPostsListView(generics.ListAPIView):
    """
    Колдонуучунун сактап койгон посттору.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from .models import Bookmark
        bookmarked_post_ids = Bookmark.objects.filter(user=self.request.user).values_list("post_id", flat=True)
        return (
            Post.objects.filter(id__in=bookmarked_post_ids)
            .select_related("author", "author__profile")
            .prefetch_related("likes", "comments", "images")
            .order_by("-bookmarks__created_at")
        )


class ExplorePostsView(generics.ListAPIView):
    """
    Explore (Изилдөө) баракчасы үчүн сунушталган посттор.
    Лайк жана комментарийлердин санына жараша же жакынкы популярдуу постторду чыгарат.
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Count
        return (
            Post.objects.annotate(total_engagement=Count("likes") + Count("comments"))
            .select_related("author", "author__profile")
            .prefetch_related("likes", "comments", "images")
            .order_by("-total_engagement", "-created_at")[:60]
        )

