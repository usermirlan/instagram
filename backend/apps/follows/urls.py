from django.urls import path
from .views import FollowToggleView, FollowersListView, FollowingListView, FeedView

urlpatterns = [
    path("feed/", FeedView.as_view(), name="feed"),
    path("follows/<str:username>/toggle/", FollowToggleView.as_view(), name="follow_toggle"),
    path("follows/<str:username>/followers/", FollowersListView.as_view(), name="followers_list"),
    path("follows/<str:username>/following/", FollowingListView.as_view(), name="following_list"),
]
