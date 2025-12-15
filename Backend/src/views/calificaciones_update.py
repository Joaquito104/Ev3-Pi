"""
Vistas para edición de calificaciones por corredor
Permite cambiar estado OBSERVADA → BORRADOR
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from src.models import Auditoria
from src.views.calificaciones_mongo import CalificacionCorredorDetailView
import pymongo

class CalificacionCorredorUpdateView(APIView):
    """
    PUT/PATCH: Actualizar calificación del corredor
    - Solo corredor propietario puede editar
    - Solo puede cambiar de OBSERVADA a BORRADOR
    - Registra cambios en auditoría
    """
    permission_classes = [IsAuthenticated]

    def put(self, request, calificacion_id):
        """Actualizar calificación (solo corredor)"""

        if request.user.perfil.rol != "CORREDOR":
            return Response(
                {"detail": "Solo corredores pueden editar calificaciones"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Conectar a MongoDB
            from django.conf import settings
            config = settings.MONGODB_CONFIG

            client = pymongo.MongoClient(
                host=config['host'],
                port=config['port'],
                username=config['username'],
                password=config['password'],
                authSource=config['auth_source'],
                authMechanism=config['auth_mechanism'],
                tls=config['use_tls'],
            )

            db = client[config['db_name']]
            col = db['calificaciones']

            # Obtener calificación
            calif = col.find_one({"_id": pymongo.errors.OperationFailure})
            if not calif:
                return Response(
                    {"detail": "Calificación no encontrada"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Verificar propietario
            if calif.get('corredor_id') != request.user.id:
                return Response(
                    {"detail": "No tienes permiso para editar esta calificación"},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Obtener nuevo estado
            nuevo_estado = request.data.get('estado')
            motivo = request.data.get('motivo', '')

            estado_actual = calif.get('estado')

            # Validar transición de estado
            transiciones_permitidas = {
                'OBSERVADA': ['BORRADOR'],
            }

            if estado_actual not in transiciones_permitidas:
                return Response(
                    {"detail": f"No puedes editar calificaciones en estado {estado_actual}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if nuevo_estado not in transiciones_permitidas[estado_actual]:
                return Response(
                    {"detail": f"No puedes cambiar de {estado_actual} a {nuevo_estado}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Actualizar calificación
            resultado = col.update_one(
                {"_id": calif['_id']},
                {
                    "$set": {
                        "estado": nuevo_estado,
                        "motivo_cambio": motivo,
                        "actualizado_por": request.user.username,
                        "fecha_actualizacion": str(__import__('datetime').datetime.now()),
                    }
                }
            )

            if resultado.modified_count == 0:
                raise Exception("Error al actualizar")

            # Registrar en auditoría
            Auditoria.objects.create(
                usuario=request.user,
                accion="UPDATE",
                modelo="Calificacion",
                objeto_id=str(calif['_id']),
                ip_address=self._obtener_ip(request),
                descripcion=f"Cambio de estado: {estado_actual} → {nuevo_estado}. Motivo: {motivo}"
            )

            # Obtener calificación actualizada
            calif_actualizada = col.find_one({"_id": calif['_id']})
            # Convertir ObjectId a string
            calif_actualizada['_id'] = str(calif_actualizada['_id'])

            client.close()

            return Response({
                "detail": f"Calificación actualizada a {nuevo_estado}",
                "calificacion": calif_actualizada
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error: {str(e)}")
            return Response(
                {"detail": f"Error al actualizar: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def patch(self, request, calificacion_id):
        """Alias para PUT"""
        return self.put(request, calificacion_id)

    def _obtener_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')
