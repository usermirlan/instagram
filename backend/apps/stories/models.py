from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class Story(models.Model):
    """
    24 саатта өчүүчү тарых (Story).
    Сүрөт же видео форматында болот.
    """
    MEDIA_TYPES = (
        ("image", "Сүрөт"),
        ("video", "Видео"),
    )

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="stories")
    media = models.FileField(upload_to="stories/%Y/%m/%d/")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES, default="image")
    caption = models.CharField(max_length=500, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Stories"

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def views_count(self):
        return self.views.count()

    def __str__(self):
        return f"Story #{self.id} by {self.author.username}"


class StoryView(models.Model):
    """
    Story'ну ким көргөнүн сактоо.
    """
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name="views")
    viewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="viewed_stories")
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("story", "viewer")
        ordering = ["-viewed_at"]

    def __str__(self):
        return f"{self.viewer.username} viewed Story #{self.story_id}"
