from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction

from src.models import ReglaNegocio, HistorialReglaNegocio, Auditoria
from src.permissions import TieneRol


class HistorialReglaView(APIView):
    """
    Obtener historial completo de versiones de una regla
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN", "AUDITOR"]

    def get(self, request, pk):
        """Listar todas las versiones de una regla"""
        try:
            regla = ReglaNegocio.objects.get(pk=pk)
        except ReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Regla no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Obtener historial ordenado por versión descendente
        historial = HistorialReglaNegocio.objects.filter(
            regla_actual=regla
        ).order_by('-version')

        data = [
            {
                "id": h.id,
                "nombre": h.nombre,
                "descripcion": h.descripcion,
                "condicion": h.condicion,
                "accion": h.accion,
                "version": h.version,
                "estado": h.estado,
                "modificado_por": h.modificado_por.username if h.modificado_por else "Sistema",
                "fecha_snapshot": h.fecha_snapshot.strftime("%Y-%m-%d %H:%M:%S"),
                "comentario": h.comentario,
            }
            for h in historial
        ]

        return Response({
            "regla_id": regla.id,
            "nombre_actual": regla.nombre,
            "version_actual": regla.version,
            "historial": data
        })


class RollbackReglaView(APIView):
    """
    Restaurar una regla a una versión anterior del historial
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    @transaction.atomic
    def post(self, request, pk):
        """
        Rollback de regla a versión especificada
        Body: { "version": 2, "comentario": "Razón del rollback" }
        """
        try:
            regla = ReglaNegocio.objects.get(pk=pk)
        except ReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Regla no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        version_destino = request.data.get("version")
        comentario = request.data.get("comentario", "Rollback sin comentario")

        if not version_destino:
            return Response(
                {"detail": "Debe especificar la versión de destino"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar snapshot de esa versión
        try:
            snapshot = HistorialReglaNegocio.objects.get(
                regla_actual=regla,
                version=version_destino
            )
        except HistorialReglaNegocio.DoesNotExist:
            return Response(
                {"detail": f"No existe snapshot de versión {version_destino}"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Guardar snapshot del estado actual antes de rollback
        HistorialReglaNegocio.objects.create(
            regla_actual=regla,
            nombre=regla.nombre,
            descripcion=regla.descripcion,
            condicion=regla.condicion,
            accion=regla.accion,
            version=regla.version,
            estado=regla.estado,
            modificado_por=request.user,
            comentario=f"Pre-rollback a v{version_destino}"
        )

        # Restaurar datos del snapshot
        regla.nombre = snapshot.nombre
        regla.descripcion = snapshot.descripcion
        regla.condicion = snapshot.condicion
        regla.accion = snapshot.accion
        regla.estado = snapshot.estado
        regla.version += 1  # Nueva versión tras rollback
        regla.save()

        # Crear nuevo snapshot del estado restaurado
        HistorialReglaNegocio.objects.create(
            regla_actual=regla,
            nombre=regla.nombre,
            descripcion=regla.descripcion,
            condicion=regla.condicion,
            accion=regla.accion,
            version=regla.version,
            estado=regla.estado,
            modificado_por=request.user,
            comentario=f"Rollback desde v{version_destino}: {comentario}"
        )

        # Auditoría del rollback
        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'ADMIN'),
            accion="UPDATE",
            modelo="ReglaNegocio",
            objeto_id=regla.id,
            descripcion=f"Rollback de regla '{regla.nombre}' a versión {version_destino}. Nueva versión: {regla.version}"
        )

        return Response({
            "detail": f"Rollback exitoso a versión {version_destino}",
            "nueva_version": regla.version,
            "nombre": regla.nombre
        })


class CompararVersionesView(APIView):
    """
    Comparar dos versiones de una regla (diff básico)
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN", "AUDITOR"]

    def get(self, request, pk):
        """
        Comparar dos versiones
        Query params: ?v1=1&v2=2
        """
        try:
            regla = ReglaNegocio.objects.get(pk=pk)
        except ReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Regla no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        v1 = request.query_params.get("v1")
        v2 = request.query_params.get("v2")

        if not v1 or not v2:
            return Response(
                {"detail": "Debe especificar v1 y v2 como query params"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            version1 = HistorialReglaNegocio.objects.get(regla_actual=regla, version=v1)
            version2 = HistorialReglaNegocio.objects.get(regla_actual=regla, version=v2)
        except HistorialReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Una o ambas versiones no existen en el historial"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Comparación simple campo por campo
        diff = {
            "regla_id": regla.id,
            "version_1": {
                "version": version1.version,
                "nombre": version1.nombre,
                "descripcion": version1.descripcion,
                "condicion": version1.condicion,
                "accion": version1.accion,
                "estado": version1.estado,
            },
            "version_2": {
                "version": version2.version,
                "nombre": version2.nombre,
                "descripcion": version2.descripcion,
                "condicion": version2.condicion,
                "accion": version2.accion,
                "estado": version2.estado,
            },
            "cambios": {
                "nombre": version1.nombre != version2.nombre,
                "descripcion": version1.descripcion != version2.descripcion,
                "condicion": version1.condicion != version2.condicion,
                "accion": version1.accion != version2.accion,
                "estado": version1.estado != version2.estado,
            }
        }

        return Response(diff)
