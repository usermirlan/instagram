"""
MikoSocial — Негизги URL конфигурациясы.

Бардык API endpoint'тор /api/ префикси менен башталат.
Ар бир app'тын URL'дери өзүнчө файлда аныкталат.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin панели
    path("admin/", admin.site.urls),

    # API endpoints
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.posts.urls")),
    path("api/", include("apps.follows.urls")),
    path("api/", include("apps.chat.urls")),
    path("api/", include("apps.notifications.urls")),
]

# Development режиминде медиа файлдарды сервер аркылуу берүү
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
