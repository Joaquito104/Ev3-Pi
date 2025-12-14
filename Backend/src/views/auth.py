from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from src.serializers import RegistroUsuarioSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mi_perfil(request):
    perfil = getattr(request.user, "perfil", None)
    rol = perfil.rol if perfil else None

    if request.user.is_superuser and not rol:
        rol = "TI"

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "rol": rol,
        "is_superuser": request.user.is_superuser,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def registrar_usuario(request):
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Usuario creado correctamente"},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
