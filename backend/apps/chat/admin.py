from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("sender", "text", "is_read", "created_at")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "display_participants", "updated_at", "created_at")
    inlines = [MessageInline]

    def display_participants(self, obj):
        return ", ".join([u.username for u in obj.participants.all()])
    display_participants.short_description = "Катышуучулар"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "conversation", "sender", "short_text", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("sender__username", "text")

    def short_text(self, obj):
        return obj.text[:50]
    short_text.short_description = "Билдирүү"
