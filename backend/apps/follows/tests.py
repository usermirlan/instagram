from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Follow


class FollowSystemTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="Password123!")
        self.user2 = User.objects.create_user(username="user2", password="Password123!")
        self.user3 = User.objects.create_user(username="user3", password="Password123!")
        self.client.force_authenticate(user=self.user1)

    def test_follow_user(self):
        res = self.client.post("/api/follows/user2/toggle/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_following"])
        self.assertEqual(res.data["followers_count"], 1)

    def test_unfollow_user(self):
        Follow.objects.create(follower=self.user1, following=self.user2)
        res = self.client.post("/api/follows/user2/toggle/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["is_following"])
        self.assertEqual(res.data["followers_count"], 0)

    def test_cannot_follow_self(self):
        res = self.client.post("/api/follows/user1/toggle/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_followers_list(self):
        Follow.objects.create(follower=self.user1, following=self.user2)
        Follow.objects.create(follower=self.user3, following=self.user2)
        res = self.client.get("/api/follows/user2/followers/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data.get("results", res.data)
        self.assertEqual(len(data), 2)

    def test_following_list(self):
        Follow.objects.create(follower=self.user1, following=self.user2)
        Follow.objects.create(follower=self.user1, following=self.user3)
        res = self.client.get("/api/follows/user1/following/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data.get("results", res.data)
        self.assertEqual(len(data), 2)

    def test_feed_shows_own_and_followed_posts(self):
        from apps.posts.tests import generate_test_image
        from apps.posts.models import Post

        Follow.objects.create(follower=self.user1, following=self.user2)
        Post.objects.create(author=self.user1, image=generate_test_image(), caption="My post")
        Post.objects.create(author=self.user2, image=generate_test_image(), caption="User2 post")
        Post.objects.create(author=self.user3, image=generate_test_image(), caption="User3 post")

        res = self.client.get("/api/feed/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data.get("results", res.data)
        captions = [p["caption"] for p in data]
        self.assertIn("My post", captions)
        self.assertIn("User2 post", captions)
        self.assertNotIn("User3 post", captions)
