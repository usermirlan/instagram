import io
from PIL import Image
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Post, Like, Comment


def generate_test_image():
    file = io.BytesIO()
    image = Image.new("RGBA", size=(100, 100), color=(155, 0, 0))
    image.save(file, "png")
    file.name = "test.png"
    file.seek(0)
    return SimpleUploadedFile("test.png", file.read(), content_type="image/png")


class PostSystemTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username="user1", password="Password123!")
        self.user2 = User.objects.create_user(username="user2", password="Password123!")
        self.client.force_authenticate(user=self.user1)

    def test_create_post_success(self):
        image = generate_test_image()
        data = {
            "image": image,
            "caption": "Салам, бул менин биринчи постум!",
        }
        response = self.client.post("/api/posts/", data, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        post = Post.objects.first()
        self.assertEqual(post.author, self.user1)
        self.assertEqual(post.caption, "Салам, бул менин биринчи постум!")

    def test_post_delete_by_author(self):
        post = Post.objects.create(author=self.user1, image=generate_test_image(), caption="Delete me")
        response = self.client.delete(f"/api/posts/{post.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Post.objects.count(), 0)

    def test_post_delete_by_other_user_forbidden(self):
        post = Post.objects.create(author=self.user1, image=generate_test_image(), caption="Cannot delete")
        self.client.force_authenticate(user=self.user2)
        response = self.client.delete(f"/api/posts/{post.id}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Post.objects.count(), 1)

    def test_like_unlike_toggle(self):
        post = Post.objects.create(author=self.user1, image=generate_test_image(), caption="Test likes")
        
        # 1-басуу: Like
        res1 = self.client.post(f"/api/posts/{post.id}/like/")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(res1.data["liked"])
        self.assertEqual(res1.data["likes_count"], 1)

        # 2-басуу: Unlike
        res2 = self.client.post(f"/api/posts/{post.id}/like/")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["liked"])
        self.assertEqual(res2.data["likes_count"], 0)

    def test_create_and_delete_comment(self):
        post = Post.objects.create(author=self.user1, image=generate_test_image(), caption="Comment on me")
        
        # Комментарий жазуу
        res_comment = self.client.post(
            f"/api/posts/{post.id}/comments/",
            {"text": "Азаматсыз, сонун пост!"},
        )
        self.assertEqual(res_comment.status_code, status.HTTP_201_CREATED)
        self.assertEqual(post.comments.count(), 1)
        comment_id = res_comment.data["id"]

        # Комментарийди өчүрүү
        res_del = self.client.delete(f"/api/comments/{comment_id}/")
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(post.comments.count(), 0)
