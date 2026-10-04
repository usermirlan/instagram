from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    LogoutView,
    CurrentUserView,
    ProfileUpdateView,
    UserProfileDetailView,
    UserSearchView,
)

urlpatterns = [
    # Auth endpoints
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),

    # Users / Profile endpoints
    path("users/me/", CurrentUserView.as_view(), name="user_me"),
    path("users/me/update/", ProfileUpdateView.as_view(), name="profile_update"),
    path("users/search/", UserSearchView.as_view(), name="user_search"),
    path("users/<str:username>/", UserProfileDetailView.as_view(), name="user_profile_detail"),
]
