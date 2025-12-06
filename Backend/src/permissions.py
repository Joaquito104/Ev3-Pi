from rest_framework.permissions import BasePermission, SAFE_METHODS

class PermisoRegistro(BasePermission):
    """
    Controla quién puede ver/editar registros según rol.
    """

    def has_permission(self, request, view):
        # Superusuarios siempre pasan
        if request.user and request.user.is_superuser:
            return True

        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        perfil = getattr(request.user, "perfil", None)
        rol = getattr(perfil, "rol", None)

        # Superusuarios sin restricciones
        if request.user.is_superuser:
            return True

        # AUDITOR -> solo lectura
        if rol == "AUDITOR":
            return request.method in SAFE_METHODS

        # ANALISTA o TI -> todo permitido
        if rol in ("ANALISTA", "TI"):
            return True

        # CORREDOR:
        if rol == "CORREDOR":
            # Puede ver solo los suyos y solo lectura
            if request.method in SAFE_METHODS and obj.usuario == request.user:
                return True
            # (si quieres permitir que cree nuevos, se controla en view)
            return False

        # Por defecto, nada
        return False
