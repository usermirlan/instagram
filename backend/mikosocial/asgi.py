"""
MikoSocial — ASGI конфигурациясы.

ASGI сервер HTTP жана WebSocket сурамдарын иштетет.
WebSocket routing кийинки фазаларда кошулат.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mikosocial.settings")

# Django ASGI тиркемеси
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        # HTTP сурамдар — Django иштетет
        "http": django_asgi_app,
        # WebSocket — кийин кошулат (Phase 13)
        # "websocket": AuthMiddlewareStack(
        #     URLRouter(
        #         chat_websocket_urlpatterns
        #     )
        # ),
    }
)
