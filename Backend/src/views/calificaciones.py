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

        try:
            registro = Registro.objects.get(id=registro_id)
        except Registro.DoesNotExist:
            return Response(
                {"detail": "Registro no existe"},
                status=404
            )

        calificacion = Calificacion.objects.create(
            registro=registro,
            creado_por=request.user,
            comentario=comentario
        )

        return Response({
            "detail": "Calificación creada",
            "id": calificacion.id,
            "estado": calificacion.estado
        })
