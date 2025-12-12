from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from src.permissions import TieneRol


class CargaCertificadosView(APIView):
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["CORREDOR", "ANALISTA", "ADMIN"]

    def post(self, request):
        return Response({"detail": "Carga de certificados recibida"})
