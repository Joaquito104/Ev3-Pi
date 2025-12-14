from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from src.models import PerfilUsuario, Auditoria, ReglaNegocio, Calificacion, Registro


class AdminGlobalPermission(IsAuthenticated):
    """
    Permiso exclusivo para superusuarios.
    Solo administradores globales pueden acceder.
    """
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_superuser


class EstadoSistemaView(APIView):
    """
    Dashboard con métricas críticas del sistema
    Solo para Administrador Global
    """
    permission_classes = [AdminGlobalPermission]

    def get(self, request):
        """Obtener estado general del sistema"""
        
        # Auditoría de acceso
        Auditoria.objects.create(
            usuario=request.user,
            rol="SUPERADMIN",
            accion="LOGIN",
            modelo="Sistema",
            descripcion="Acceso a panel de Administrador Global"
        )

        # Métricas del sistema
        total_usuarios = User.objects.count()
        usuarios_activos = User.objects.filter(is_active=True).count()
        superusuarios = User.objects.filter(is_superuser=True).count()
        
        # Actividad reciente (últimas 24h)
        hace_24h = timezone.now() - timedelta(hours=24)
        actividad_reciente = Auditoria.objects.filter(fecha__gte=hace_24h).count()
        
        # Reglas de negocio
        reglas_activas = ReglaNegocio.objects.filter(estado="ACTIVA").count()
        reglas_total = ReglaNegocio.objects.count()
        
        # Registros y calificaciones
        total_registros = Registro.objects.count()
        calificaciones_pendientes = Calificacion.objects.filter(estado="PENDIENTE").count()
        
        # Distribución de roles
        roles_count = {}
        for rol_code, rol_name in PerfilUsuario.ROL_CHOICES:
            roles_count[rol_name] = PerfilUsuario.objects.filter(rol=rol_code).count()

        return Response({
            "sistema": {
                "nombre": "NUAM - Sistema de Gestión Tributaria",
                "version": "1.0.0",
                "estado": "OPERATIVO",
                "timestamp": timezone.now().isoformat()
            },
            "usuarios": {
                "total": total_usuarios,
                "activos": usuarios_activos,
                "superusuarios": superusuarios,
                "por_rol": roles_count
            },
            "actividad": {
                "ultimas_24h": actividad_reciente,
            },
            "reglas_negocio": {
                "activas": reglas_activas,
                "total": reglas_total
            },
            "operaciones": {
                "registros": total_registros,
                "calificaciones_pendientes": calificaciones_pendientes
            }
        })


class ResetPasswordView(APIView):
    """
    Resetear contraseña de cualquier usuario (operación crítica)
    Solo Administrador Global
    """
    permission_classes = [AdminGlobalPermission]

    @transaction.atomic
    def post(self, request):
        """
        Body: { "user_id": 5, "new_password": "NuevaPass123!", "motivo": "Solicitud usuario" }
        """
        user_id = request.data.get("user_id")
        new_password = request.data.get("new_password")
        motivo = request.data.get("motivo", "Reset por administrador")

        if not user_id or not new_password:
            return Response(
                {"detail": "Se requiere user_id y new_password"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Cambiar contraseña
        user.set_password(new_password)
        user.save()

        # Auditoría crítica
        Auditoria.objects.create(
            usuario=request.user,
            rol="SUPERADMIN",
            accion="UPDATE",
            modelo="User",
            objeto_id=user.id,
            descripcion=f"🔐 RESET PASSWORD de usuario '{user.username}'. Motivo: {motivo}"
        )

        return Response({
            "detail": f"Contraseña de '{user.username}' reseteada exitosamente",
            "user_id": user.id,
            "username": user.username
        })


class BloquearDesbloquearUsuarioView(APIView):
    """
    Bloquear/desbloquear usuarios (emergencias)
    Solo Administrador Global
    """
    permission_classes = [AdminGlobalPermission]

    @transaction.atomic
    def post(self, request):
        """
        Body: { "user_id": 5, "accion": "bloquear", "motivo": "Acceso no autorizado" }
        """
        user_id = request.data.get("user_id")
        accion = request.data.get("accion")  # "bloquear" | "desbloquear"
        motivo = request.data.get("motivo", "Sin motivo especificado")

        if not user_id or accion not in ["bloquear", "desbloquear"]:
            return Response(
                {"detail": "Se requiere user_id y accion (bloquear/desbloquear)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevenir auto-bloqueo
        if user.id == request.user.id:
            return Response(
                {"detail": "No puedes bloquearte a ti mismo"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ejecutar acción
        if accion == "bloquear":
            user.is_active = False
            mensaje = f"Usuario '{user.username}' bloqueado"
        else:
            user.is_active = True
            mensaje = f"Usuario '{user.username}' desbloqueado"
        
        user.save()

        # Auditoría crítica
        Auditoria.objects.create(
            usuario=request.user,
            rol="SUPERADMIN",
            accion="UPDATE",
            modelo="User",
            objeto_id=user.id,
            descripcion=f"🚨 {accion.upper()} usuario '{user.username}'. Motivo: {motivo}"
        )

        return Response({
            "detail": mensaje,
            "user_id": user.id,
            "username": user.username,
            "is_active": user.is_active
        })


class AuditoriaGlobalView(APIView):
    """
    Auditoría completa del sistema con filtros avanzados
    Solo Administrador Global
    """
    permission_classes = [AdminGlobalPermission]

    def get(self, request):
        """
        Query params:
        - usuario_id: Filtrar por usuario
        - accion: CREATE, UPDATE, DELETE, LOGIN, RULE
        - modelo: User, ReglaNegocio, etc
        - dias: Últimos N días (default: 7)
        - limit: Límite de resultados (default: 100)
        """
        dias = int(request.query_params.get("dias", 7))
        limite = int(request.query_params.get("limit", 100))
        usuario_id = request.query_params.get("usuario_id")
        accion = request.query_params.get("accion")
        modelo = request.query_params.get("modelo")

        # Filtro base: últimos N días
        desde = timezone.now() - timedelta(days=dias)
        auditorias = Auditoria.objects.filter(fecha__gte=desde)

        # Filtros adicionales
        if usuario_id:
            auditorias = auditorias.filter(usuario_id=usuario_id)
        if accion:
            auditorias = auditorias.filter(accion=accion)
        if modelo:
            auditorias = auditorias.filter(modelo=modelo)

        # Ordenar y limitar
        auditorias = auditorias.order_by('-fecha')[:limite]

        data = [
            {
                "id": a.id,
                "usuario": a.usuario.username if a.usuario else "Sistema",
                "rol": a.rol,
                "accion": a.accion,
                "modelo": a.modelo,
                "objeto_id": a.objeto_id,
                "descripcion": a.descripcion,
                "fecha": a.fecha.strftime("%Y-%m-%d %H:%M:%S")
            }
            for a in auditorias
        ]

        return Response({
            "total": len(data),
            "filtros": {
                "dias": dias,
                "limite": limite,
                "usuario_id": usuario_id,
                "accion": accion,
                "modelo": modelo
            },
            "auditorias": data
        })


class PurgaDatosView(APIView):
    """
    Operaciones de purga de datos (EXTREMADAMENTE CRÍTICO)
    Solo Administrador Global
    """
    permission_classes = [AdminGlobalPermission]

    @transaction.atomic
    def post(self, request):
        """
        Body: { 
            "operacion": "purgar_auditoria",
            "dias": 90,
            "confirmar": "PURGAR_DEFINITIVAMENTE"
        }
        """
        operacion = request.data.get("operacion")
        confirmacion = request.data.get("confirmar")
        dias = request.data.get("dias", 90)

        if confirmacion != "PURGAR_DEFINITIVAMENTE":
            return Response(
                {"detail": "Debe confirmar con: PURGAR_DEFINITIVAMENTE"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if operacion == "purgar_auditoria":
            fecha_limite = timezone.now() - timedelta(days=dias)
            count = Auditoria.objects.filter(fecha__lt=fecha_limite).count()
            Auditoria.objects.filter(fecha__lt=fecha_limite).delete()

            # Auditoría de la purga
            Auditoria.objects.create(
                usuario=request.user,
                rol="SUPERADMIN",
                accion="DELETE",
                modelo="Auditoria",
                descripcion=f"⚠️ PURGA MASIVA: Eliminados {count} registros de auditoría anteriores a {dias} días"
            )

            return Response({
                "detail": f"Purga completada: {count} registros eliminados",
                "operacion": operacion,
                "registros_eliminados": count
            })

        return Response(
            {"detail": "Operación no válida"},
            status=status.HTTP_400_BAD_REQUEST
        )
