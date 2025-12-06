from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Registro, PerfilUsuario
from .serializers import RegistroSerializer, UserSerializer
from .permissions import PermisoRegistro


# ------------------------------------
#            REGISTROS
# ------------------------------------
class RegistroViewSet(viewsets.ModelViewSet):
    queryset = Registro.objects.all().order_by("-fecha")
    serializer_class = RegistroSerializer
    permission_classes = [permissions.IsAuthenticated, PermisoRegistro]

    def get_queryset(self):
        user = self.request.user
        perfil = getattr(user, "perfil", None)  # ← CORRECTO
        rol = getattr(perfil, "rol", None)

        if user.is_superuser:
            return Registro.objects.all().order_by("-fecha")

        if rol == "TI":
            return Registro.objects.all().order_by("-fecha")

        if rol in ("ANALISTA", "AUDITOR"):
            return Registro.objects.all().order_by("-fecha")

        if rol == "CORREDOR":
            return Registro.objects.filter(usuario=user).order_by("-fecha")

        return Registro.objects.none()

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


# ------------------------------------
#               LOGIN
# ------------------------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            return Response({"detail": "Credenciales inválidas"}, status=400)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data
        })


# ------------------------------------
#           PERFIL DE USUARIO
# ------------------------------------
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def mi_perfil(request):
    perfil = getattr(request.user, "perfil", None)
    rol = perfil.rol if perfil else None

    # Si es superusuario y no tiene perfil, darle un rol lógico para el front
    if request.user.is_superuser and not rol:
        rol = "TI"

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "rol": rol,
        "is_superuser": request.user.is_superuser,
    })
