from django.urls import path
from .views import (
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    UnreadNotificationCountView,
)

urlpatterns = [
    path("notifications/", NotificationListView.as_view(), name="notification_list"),
    path("notifications/<int:pk>/read/", NotificationMarkReadView.as_view(), name="notification_mark_read"),
    path("notifications/read-all/", NotificationMarkAllReadView.as_view(), name="notification_read_all"),
    path("notifications/unread-count/", UnreadNotificationCountView.as_view(), name="notification_unread_count"),
]
