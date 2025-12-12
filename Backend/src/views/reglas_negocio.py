from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from src.models import ReglaNegocio
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
                "version": r.version,
                "estado": r.estado,
                "creado_por": r.creado_por.username,
            }
            for r in reglas
        ]
        return Response(data)

    def post(self, request):
        regla = ReglaNegocio.objects.create(
            nombre=request.data.get("nombre"),
            descripcion=request.data.get("descripcion"),
            condicion=request.data.get("condicion"),
            accion=request.data.get("accion"),
            creado_por=request.user,
        )
        return Response({
            "detail": "Regla creada",
            "id": regla.id
        })
