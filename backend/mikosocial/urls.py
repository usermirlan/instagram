"""
MikoSocial — Негизги URL конфигурациясы.

Бардык API endpoint'тор /api/ префикси менен башталат.
Ар бир app'тын URL'дери өзүнчө файлда аныкталат.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import HttpResponse

def home_view(request):
    html_content = """
    <!DOCTYPE html>
    <html lang="ky">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MikoSocial API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                color: #f8fafc;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
            }
            .card {
                background: rgba(30, 41, 59, 0.85);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 40px;
                max-width: 480px;
                width: 100%;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                text-align: center;
            }
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                background: rgba(34, 197, 94, 0.15);
                color: #4ade80;
                border: 1px solid rgba(74, 222, 128, 0.3);
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 20px;
            }
            .badge-dot {
                width: 8px;
                height: 8px;
                background: #4ade80;
                border-radius: 50%;
                box-shadow: 0 0 10px #4ade80;
            }
            h1 {
                margin: 0 0 10px 0;
                font-size: 2rem;
                background: linear-gradient(135deg, #a855f7, #ec4899);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            p {
                color: #94a3b8;
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 25px;
            }
            .btn-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .btn {
                display: block;
                padding: 12px 20px;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.2s ease;
            }
            .btn-primary {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
            }
            .btn-secondary {
                background: rgba(255, 255, 255, 0.05);
                color: #e2e8f0;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">
                <span class="badge-dot"></span> Backend Live & Running 🚀
            </div>
            <h1>MikoSocial API</h1>
            <p>Django REST Framework API жана Channels ASGI сервери ийгиликтүү иштеп жатат.</p>
            <div class="btn-group">
                <a href="/admin/" class="btn btn-primary">Админ панелге өтүү (/admin/)</a>
                <a href="/api/posts/" class="btn btn-secondary">API Посттор (/api/posts/)</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)

urlpatterns = [
    # Башкы бет (API Status)
    path("", home_view, name="home"),

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
