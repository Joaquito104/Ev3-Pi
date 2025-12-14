"""
Vistas mejoradas de autenticación JWT con rotación de tokens y blacklist
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.utils import timezone
from src.models import Auditoria
import redis
import json

# Conexión a Redis para blacklist de tokens
try:
    r = redis.Redis(host='localhost', port=6379, db=1, decode_responses=True)
    r.ping()
    REDIS_AVAILABLE = True
except:
    REDIS_AVAILABLE = False


class LogoutView(APIView):
    """
    Logout que añade el refresh token a la blacklist
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Blacklist del refresh token actual
        """
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token requerido"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            # Agregar a blacklist
            self._blacklist_token(refresh_token, token.lifetime)

            # Registrar logout en auditoría
            Auditoria.objects.create(
                usuario=request.user,
                accion="LOGOUT",
                modelo="User",
                objeto_id=request.user.id,
                ip_address=self._obtener_ip(request),
                descripcion="Cierre de sesión"
            )

            return Response(
                {"detail": "Sesión cerrada exitosamente"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": "Error al cerrar sesión"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _blacklist_token(self, token, lifetime):
        """Blacklist el token en Redis"""
        if REDIS_AVAILABLE:
            # Guardar token en blacklist con expiración
            r.setex(f"blacklist:{token}", int(lifetime.total_seconds()), "1")

    def _obtener_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class RefreshTokenView(APIView):
    """
    Refresh token con rotación automática
    - Valida el refresh token actual
    - Genera nuevo access token
    - Genera nuevo refresh token (rotación)
    - Blacklist el refresh token anterior
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        POST con refresh token
        Retorna nuevo access y refresh tokens
        """
        refresh = request.data.get('refresh')
        
        if not refresh:
            return Response(
                {"detail": "Refresh token requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar si el token está en blacklist
        if REDIS_AVAILABLE and self._esta_en_blacklist(refresh):
            return Response(
                {"detail": "Token revocado. Inicia sesión nuevamente"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            token = RefreshToken(refresh)
            
            # Blacklist el refresh token anterior
            self._blacklist_token(refresh, token.lifetime)

            # Generar nuevos tokens
            return Response({
                "access": str(token.access_token),
                "refresh": str(token),
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response(
                {"detail": "Token inválido o expirado"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except InvalidToken:
            return Response(
                {"detail": "Token inválido"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"detail": "Error al renovar token"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _esta_en_blacklist(self, token):
        """Verificar si token está en blacklist"""
        if REDIS_AVAILABLE:
            return r.exists(f"blacklist:{token}") > 0
        return False

    def _blacklist_token(self, token, lifetime):
        """Blacklist el token en Redis"""
        if REDIS_AVAILABLE:
            r.setex(f"blacklist:{token}", int(lifetime.total_seconds()), "1")


class TokenBlacklistMiddleware:
    """
    Middleware para validar que los tokens no estén en blacklist
    Se puede usar en APIView con @api_view o como middleware
    """
    def __init__(self, get_response=None):
        self.get_response = get_response

    def __call__(self, request):
        # Verificar token en header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            if REDIS_AVAILABLE and r.exists(f"blacklist:{token}"):
                return Response(
                    {"detail": "Token revocado"},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        response = self.get_response(request)
        return response


class TokenStatsView(APIView):
    """
    Ver estadísticas de tokens activos y revocados
    Solo para admin
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener estadísticas de tokens"""
        if not request.user.is_superuser:
            return Response(
                {"detail": "No tienes permisos"},
                status=status.HTTP_403_FORBIDDEN
            )

        if not REDIS_AVAILABLE:
            return Response(
                {"detail": "Redis no disponible"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Contar tokens en blacklist
        pattern = "blacklist:*"
        blacklist_count = len(r.keys(pattern))

        return Response({
            "redis_available": True,
            "tokens_blacklist_count": blacklist_count,
            "timestamp": timezone.now().isoformat(),
        })
