from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    UserPostsListView,
    PostLikeToggleView,
    CommentListCreateView,
    CommentDeleteView,
    BookmarkToggleView,
    SavedPostsListView,
    ExplorePostsView,
)

urlpatterns = [
    path("posts/", PostListCreateView.as_view(), name="post_list_create"),
    path("posts/explore/", ExplorePostsView.as_view(), name="explore_posts"),
    path("posts/saved/", SavedPostsListView.as_view(), name="saved_posts"),
    path("posts/<int:pk>/", PostDetailView.as_view(), name="post_detail"),
    path("posts/user/<str:username>/", UserPostsListView.as_view(), name="user_posts_list"),
    path("posts/<int:post_id>/like/", PostLikeToggleView.as_view(), name="post_like_toggle"),
    path("posts/<int:post_id>/bookmark/", BookmarkToggleView.as_view(), name="post_bookmark_toggle"),
    path("posts/<int:post_id>/comments/", CommentListCreateView.as_view(), name="comment_list_create"),
    path("comments/<int:pk>/", CommentDeleteView.as_view(), name="comment_delete"),
]
