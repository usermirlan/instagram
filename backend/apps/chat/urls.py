from django.urls import path
from .views import (
    ConversationListCreateView,
    MessageListCreateView,
    UnreadMessageCountView,
)

urlpatterns = [
    path("chat/conversations/", ConversationListCreateView.as_view(), name="conversation_list_create"),
    path("chat/conversations/<int:conversation_id>/messages/", MessageListCreateView.as_view(), name="message_list_create"),
    path("chat/unread-count/", UnreadMessageCountView.as_view(), name="chat_unread_count"),
]
