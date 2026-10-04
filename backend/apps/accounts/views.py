from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Profile
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    Жаңы колдонуучуну каттоо.
    Катталгандан кийин дароо JWT Access жана Refresh токендери берилет.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Дароо JWT токендерин генерация кылуу
        refresh = RefreshToken.for_user(user)
        refresh["username"] = user.username
        refresh["email"] = user.email

        user_data = UserSerializer(user).data

        return Response(
            {
                "message": "Каттоо ийгиликтүү аяктады!",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Кирүү (Login) — JWT Access + Refresh token жана User маалыматын кайтарат.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """
    Чыгуу (Logout) — Refresh token'ди blacklist'ке кошот.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "refresh token берилиши керек."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Ийгиликтүү чыктыңыз."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": "Жараксыз токен же ката кетти."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CurrentUserView(generics.RetrieveAPIView):
    """
    Учурдагы кирген колдонуучунун маалыматын алуу.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ProfileUpdateView(generics.UpdateAPIView):
    """
    Жеке профилди өзгөртүү (bio, avatar, first_name, last_name).
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileUpdateSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class UserProfileDetailView(generics.RetrieveAPIView):
    """
    Кандайдыр бир колдонуучунун профилин username аркылуу көрүү.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    lookup_field = "username"
    queryset = User.objects.all()


class UserSearchView(generics.ListAPIView):
    """
    Колдонуучуларды username же аты-жөнү боюнча издөө.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        user = self.request.user
        if not query:
            return User.objects.exclude(id=user.id).order_by("-date_joined")[:15]
        return User.objects.filter(
            Q(username__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
        ).exclude(id=user.id).order_by("-date_joined")[:25]

