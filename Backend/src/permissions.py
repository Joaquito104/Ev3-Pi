from rest_framework.permissions import BasePermission, SAFE_METHODS
from .rbac import ROLES


class PermisoRegistro(BasePermission):
    """
    Permisos específicos para el modelo Registro
    Basado estrictamente en la matriz RBAC del proyecto.
    """

    def has_permission(self, request, view):
        # Usuario debe estar autenticado
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin global pasa siempre
        if request.user.is_superuser:
            return True

        # El detalle se controla a nivel de objeto
        return True


    def has_object_permission(self, request, view, obj):
        perfil = getattr(request.user, "perfil", None)
        rol = getattr(perfil, "rol", None)

        # Admin global
        if request.user.is_superuser:
            return True

        # ----- AUDITOR -----
        if rol == ROLES["AUDITOR"]:
            # Solo lectura
            return request.method in SAFE_METHODS

        # ----- ANALISTA -----
        if rol == ROLES["ANALISTA"]:
            # Puede ver, crear y editar
            return True

        # ----- ADMIN TI -----
        if rol == ROLES["TI"]:
            # Acceso total por política
            return True

        # ----- CORREDOR -----
        if rol == ROLES["CORREDOR"]:
            # Solo lectura y solo sus registros
            if request.method in SAFE_METHODS and obj.usuario == request.user:
                return True
            return False

        return False


class TieneRol(BasePermission):
    """
    Permiso genérico para vistas por rol (RBAC puro)
    """

    def has_permission(self, request, view):
        # Debe estar autenticado
        if not request.user or not request.user.is_authenticated:
            return False

        # Superusuario pasa siempre
        if request.user.is_superuser:
            return True

        perfil = getattr(request.user, "perfil", None)
        if not perfil:
            return False

        rol_usuario = perfil.rol
        roles_permitidos = getattr(view, "roles_permitidos", [])

        # DEBUG (puedes borrar luego)
        print("ROL DEL USUARIO:", rol_usuario)
        print("ROLES PERMITIDOS:", roles_permitidos)

        return rol_usuario in roles_permitidos
