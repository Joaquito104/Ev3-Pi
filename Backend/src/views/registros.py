from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from src.models import Registro
from src.serializers import RegistroSerializer
from src.permissions import PermisoRegistro
from src.rbac import ROLES


class RegistroViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroSerializer
    permission_classes = [permissions.IsAuthenticated, PermisoRegistro]

    def get_queryset(self):
        user = self.request.user
        perfil = getattr(user, "perfil", None)
        rol = getattr(perfil, "rol", None)

        if user.is_superuser:
            return Registro.objects.all().order_by("-fecha")

        if rol in (ROLES["ANALISTA"], ROLES["AUDITOR"], ROLES["TI"]):
            return Registro.objects.all().order_by("-fecha")

        if rol == ROLES["CORREDOR"]:
            return Registro.objects.filter(usuario=user).order_by("-fecha")

        return Registro.objects.none()

    def perform_create(self, serializer):
        perfil = getattr(self.request.user, "perfil", None)
        rol = getattr(perfil, "rol", None)

        # ❌ CORREDOR NO puede crear
        if rol == ROLES["CORREDOR"]:
            raise PermissionDenied("El corredor no puede crear registros")

        serializer.save(usuario=self.request.user)
