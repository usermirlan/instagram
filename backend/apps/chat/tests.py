from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Conversation, Message


class ChatSystemTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="alice", email="alice@test.com", password="Password123!")
        self.user2 = User.objects.create_user(username="bob", email="bob@test.com", password="Password123!")
        self.user3 = User.objects.create_user(username="charlie", email="charlie@test.com", password="Password123!")

    def test_start_conversation_and_send_message(self):
        self.client.force_authenticate(user=self.user1)

        # 1. Start conversation with bob
        res = self.client.post("/api/chat/conversations/", {"username": "bob"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        conv_id = res.data["id"]

        # Check other_user
        self.assertEqual(res.data["other_user"]["username"], "bob")

        # 2. Send message
        msg_res = self.client.post(f"/api/chat/conversations/{conv_id}/messages/", {"text": "Салам Боб!"})
        self.assertEqual(msg_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(msg_res.data["text"], "Салам Боб!")
        self.assertEqual(msg_res.data["sender_username"], "alice")

        # 3. Check bob sees the unread message
        self.client.force_authenticate(user=self.user2)
        unread_res = self.client.get("/api/chat/unread-count/")
        self.assertEqual(unread_res.data["unread_count"], 1)

        # 4. Bob reads the messages
        list_res = self.client.get(f"/api/chat/conversations/{conv_id}/messages/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

        # 5. Unread count should now be 0
        unread_res2 = self.client.get("/api/chat/unread-count/")
        self.assertEqual(unread_res2.data["unread_count"], 0)

    def test_conversation_privacy(self):
        self.client.force_authenticate(user=self.user1)
        conv_res = self.client.post("/api/chat/conversations/", {"username": "bob"})
        conv_id = conv_res.data["id"]

        # Charlie tries to read Alice & Bob's conversation
        self.client.force_authenticate(user=self.user3)
        res = self.client.get(f"/api/chat/conversations/{conv_id}/messages/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
