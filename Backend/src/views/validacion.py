from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from src.permissions import TieneRol


class BandejaValidacionView(APIView):
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["ANALISTA", "TI", "ADMIN"]

    def get(self, request):
        return Response({
            "detail": "Bandeja de validación"
        })
