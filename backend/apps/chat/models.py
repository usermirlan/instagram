from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    """
    Эки колдонуучунун ортосундагы диалог (жеке билдирүүлөр).
    """
    participants = models.ManyToManyField(User, related_name="conversations")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        usernames = ", ".join([u.username for u in self.participants.all()])
        return f"Conversation ({usernames})"


class Message(models.Model):
    """
    Диалогдогу жеке билдирүү.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    text = models.TextField(max_length=2000)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message from {self.sender.username}: {self.text[:30]}"
