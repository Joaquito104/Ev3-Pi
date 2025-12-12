from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from src.permissions import TieneRol


class ReglasNegocioView(APIView):
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    def post(self, request):
        return Response({
            "detail": "Regla de negocio creada"
        })
