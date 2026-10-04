from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Автор гана өзүнүн постун же комментарийин оңдоп/өчүрө алат.
    Башка колдонуучуларга окууга гана (SAFE_METHODS: GET, HEAD, OPTIONS) уруксат.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user
