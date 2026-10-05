from django.urls import path
from .views import StoryFeedView, StoryCreateView, StoryViewRegisterView, StoryDeleteView

urlpatterns = [
    path("stories/feed/", StoryFeedView.as_view(), name="story_feed"),
    path("stories/create/", StoryCreateView.as_view(), name="story_create"),
    path("stories/<int:story_id>/view/", StoryViewRegisterView.as_view(), name="story_view_register"),
    path("stories/<int:story_id>/delete/", StoryDeleteView.as_view(), name="story_delete"),
]
