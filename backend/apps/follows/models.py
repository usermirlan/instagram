from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_set")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers_set")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("follower", "following")
        ordering = ["-created_at"]

    def clean(self):
        if self.follower == self.following:
            raise ValidationError("Өзүңүзгө жазыла албайсыз.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.follower.username} → {self.following.username}"
