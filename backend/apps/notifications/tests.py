from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from apps.posts.models import Post
from apps.notifications.models import Notification


class NotificationSystemTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="alice", email="alice@test.com", password="Password123!")
        self.user2 = User.objects.create_user(username="bob", email="bob@test.com", password="Password123!")

    def test_follow_triggers_notification(self):
        self.client.force_authenticate(user=self.user1)
        # Alice follows Bob
        self.client.post("/api/follows/bob/toggle/")

        # Bob should have 1 unread notification
        self.client.force_authenticate(user=self.user2)
        res = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["unread_count"], 1)

        # Check list of notifications
        list_res = self.client.get("/api/notifications/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get("results", list_res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["notification_type"], "follow")
        self.assertEqual(results[0]["sender"]["username"], "alice")

        # Mark all as read
        read_all_res = self.client.post("/api/notifications/read-all/")
        self.assertEqual(read_all_res.status_code, status.HTTP_200_OK)

        # Count should now be 0
        res2 = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(res2.data["unread_count"], 0)
