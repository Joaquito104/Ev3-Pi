from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction

from src.models import ReglaNegocio, HistorialReglaNegocio, Auditoria
from src.permissions import TieneRol


class ReglasNegocioView(APIView):
    """
    Gestión de reglas de negocio
    Solo Administrador TI y Admin Global
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    def get(self, request):
        reglas = ReglaNegocio.objects.all().order_by("-fecha_creacion")
        data = [
            {
                "id": r.id,
                "nombre": r.nombre,
                "descripcion": r.descripcion,
                "condicion": r.condicion,
                "accion": r.accion,
                "version": r.version,
                "estado": r.estado,
                "creado_por": r.creado_por.username,
            }
            for r in reglas
        ]
        return Response(data)

    def post(self, request):
        nombre = request.data.get("nombre")
        descripcion = request.data.get("descripcion")
        condicion = request.data.get("condicion")
        accion = request.data.get("accion")
        estado = request.data.get("estado", "REVISION")

        if not all([nombre, descripcion, condicion, accion]):
            return Response(
                {"detail": "Todos los campos son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        regla = ReglaNegocio.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            condicion=condicion,
            accion=accion,
            estado=estado,
            creado_por=request.user,
        )

        # Crear primer snapshot en historial
        HistorialReglaNegocio.objects.create(
            regla_actual=regla,
            nombre=regla.nombre,
            descripcion=regla.descripcion,
            condicion=regla.condicion,
            accion=regla.accion,
            version=regla.version,
            estado=regla.estado,
            modificado_por=request.user,
            comentario="Versión inicial"
        )

        # Auditoría de creación
        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'ADMIN'),
            accion="CREATE",
            modelo="ReglaNegocio",
            objeto_id=regla.id,
            descripcion=f"Creada regla '{regla.nombre}' v{regla.version}"
        )

        return Response({
            "detail": "Regla creada",
            "id": regla.id
        }, status=status.HTTP_201_CREATED)


class ReglaNegocioDetailView(APIView):
    """
    Detalle, actualización y eliminación de regla de negocio específica
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    def get(self, request, pk):
        """Obtener detalle de una regla"""
        try:
            regla = ReglaNegocio.objects.get(pk=pk)
            return Response({
                "id": regla.id,
                "nombre": regla.nombre,
                "descripcion": regla.descripcion,
                "condicion": regla.condicion,
                "accion": regla.accion,
                "version": regla.version,
                "estado": regla.estado,
                "creado_por": regla.creado_por.username,
            })
        except ReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Regla no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

    @transaction.atomic
    def put(self, request, pk):
        """Actualizar regla de negocio"""
        try:
            regla = ReglaNegocio.objects.get(pk=pk)
        except ReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Regla no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Guardar snapshot del estado anterior
        HistorialReglaNegocio.objects.create(
            regla_actual=regla,
            nombre=regla.nombre,
            descripcion=regla.descripcion,
            condicion=regla.condicion,
            accion=regla.accion,
            version=regla.version,
            estado=regla.estado,
            modificado_por=request.user,
            comentario=request.data.get("comentario", "Actualización")
        )

        # Actualizar campos
        regla.nombre = request.data.get("nombre", regla.nombre)
        regla.descripcion = request.data.get("descripcion", regla.descripcion)
        regla.condicion = request.data.get("condicion", regla.condicion)
        regla.accion = request.data.get("accion", regla.accion)
        regla.estado = request.data.get("estado", regla.estado)

        # Incrementar versión si cambió algo sustancial
        if "condicion" in request.data or "accion" in request.data:
            regla.version += 1

        regla.save()

        # Auditoría de actualización
        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'ADMIN'),
            accion="UPDATE",
            modelo="ReglaNegocio",
            objeto_id=regla.id,
            descripcion=f"Actualizada regla '{regla.nombre}' a v{regla.version}"
        )

        return Response({
            "detail": "Regla actualizada exitosamente",
            "id": regla.id,
            "version": regla.version
        })

    def delete(self, request, pk):
        """Eliminar regla de negocio"""
        try:
            regla = ReglaNegocio.objects.get(pk=pk)
            nombre = regla.nombre
            version = regla.version

            # Auditoría antes de eliminar
            Auditoria.objects.create(
                usuario=request.user,
                rol=getattr(request.user.perfil, 'rol', 'ADMIN'),
                accion="DELETE",
                modelo="ReglaNegocio",
                objeto_id=regla.id,
                descripcion=f"Eliminada regla '{nombre}' v{version}"
            )

            regla.delete()

            return Response({
                "detail": f"Regla '{nombre}' eliminada exitosamente"
            })
        except ReglaNegocio.DoesNotExist:
            return Response(
                {"detail": "Regla no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )
