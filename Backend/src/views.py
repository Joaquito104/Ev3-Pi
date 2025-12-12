from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Registro, PerfilUsuario
from .serializers import RegistroSerializer, UserSerializer
from .permissions import PermisoRegistro


# ======================================================
#                  REGISTROS (RBAC)
# ======================================================
class RegistroViewSet(viewsets.ModelViewSet):
    """
    CRUD de Registros con control RBAC completo.
    """
    serializer_class = RegistroSerializer
    permission_classes = [permissions.IsAuthenticated, PermisoRegistro]

    def get_queryset(self):
        user = self.request.user
        perfil = getattr(user, "perfil", None)
        rol = getattr(perfil, "rol", None)

        # Admin global
        if user.is_superuser:
            return Registro.objects.all().order_by("-fecha")

        # Administrador TI, Analista y Auditor → ven todo
        if rol in ("TI", "ANALISTA", "AUDITOR"):
            return Registro.objects.all().order_by("-fecha")

        # Corredor → solo sus registros
        if rol == "CORREDOR":
            return Registro.objects.filter(usuario=user).order_by("-fecha")

        return Registro.objects.none()

    def perform_create(self, serializer):
        # El usuario autenticado queda como dueño del registro
        serializer.save(usuario=self.request.user)


# ======================================================
#                    LOGIN (JWT)
# ======================================================
class LoginView(APIView):
    """
    Login manual (opcional).
    Normalmente se usa api/token/, pero se deja para pruebas.
    """
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


# ======================================================
#               PERFIL DEL USUARIO
# ======================================================
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def mi_perfil(request):
    """
    Endpoint clave para RBAC frontend.
    Retorna rol y si es superusuario.
    """
    perfil = getattr(request.user, "perfil", None)
    rol = perfil.rol if perfil else None

    # Superusuario sin perfil explícito
    if request.user.is_superuser and not rol:
        rol = "TI"

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "rol": rol,
        "is_superuser": request.user.is_superuser,
    })
