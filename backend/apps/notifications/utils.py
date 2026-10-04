from .models import Notification


def create_notification(recipient, sender, notification_type, post=None):
    """
    Эгер алуучу менен жөнөтүүчү бир эле адам болсо — билдирме түзүлбөйт.
    """
    if recipient == sender:
        return None

    # Окшош окула элек билдирмелерди кайталанбоо үчүн текшерүү
    if notification_type in ["like", "follow"]:
        existing = Notification.objects.filter(
            recipient=recipient,
            sender=sender,
            notification_type=notification_type,
            post=post,
            is_read=False,
        ).first()
        if existing:
            return existing

    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        post=post,
    )
