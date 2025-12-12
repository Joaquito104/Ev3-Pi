from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from src.permissions import TieneRol


class AuditoriaView(APIView):
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI", "ADMIN"]

    def get(self, request):
        return Response({"detail": "Auditoría (mock)"})
