from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


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
