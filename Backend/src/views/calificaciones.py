from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from src.permissions import TieneRol
from src.models import Calificacion, Registro


class CalificacionView(APIView):
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["ANALISTA"]

    def post(self, request):
        registro_id = request.data.get("registro_id")
        comentario = request.data.get("comentario", "")
        solicitar_auditoria = request.data.get("solicitar_auditoria", False)

        if not registro_id:
            return Response(
                {"detail": "registro_id es obligatorio"},
                status=400
            )

        try:
            registro = Registro.objects.get(id=registro_id)
        except Registro.DoesNotExist:
            return Response(
                {"detail": "Registro no existe"},
                status=404
            )

        # 🔥 CLAVE: siempre se crea como PENDIENTE
        calificacion = Calificacion.objects.create(
            registro=registro,
            creado_por=request.user,
            comentario=comentario,
            solicitar_auditoria=solicitar_auditoria,
            estado="PENDIENTE"
        )

        # Si solicita auditoría, crear registro en Auditoria
        if solicitar_auditoria:
            from src.models import Auditoria
            Auditoria.objects.create(
                usuario=request.user,
                rol=request.user.perfil.rol if hasattr(request.user, 'perfil') else "DESCONOCIDO",
                accion="RESOLUCION",
                modelo="Calificacion",
                objeto_id=calificacion.id,
                descripcion=f"Solicitud de auditoría para calificación del registro {registro.id}",
                metadatos={
                    "calificacion_id": calificacion.id,
                    "registro_id": registro.id,
                    "comentario": comentario
                }
            )

        return Response({
            "detail": "Calificación creada y enviada a validación",
            "id": calificacion.id,
            "estado": calificacion.estado,
            "registro_id": registro.id,
            "auditoria_solicitada": solicitar_auditoria
        }, status=201)
