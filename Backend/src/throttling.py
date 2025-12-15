"""
Throttling personalizado para endpoints críticos
OWASP API Security - Rate Limiting
"""
from rest_framework.throttling import SimpleRateThrottle


class LoginRateThrottle(SimpleRateThrottle):
    """
    Limita intentos de login a 5 por minuto por IP
    Previene ataques de fuerza bruta (OWASP A07)
    """
    scope = 'login'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return None  # No limitar usuarios autenticados
        # Usar IP como identificador
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class RegisterRateThrottle(SimpleRateThrottle):
    """
    Limita registros a 3 por hora por IP
    Previene spam y creación masiva de cuentas (OWASP API1)
    """
    scope = 'register'

    def get_cache_key(self, request, view):
        # Usar IP como identificador
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request)
        }


class AuditRateThrottle(SimpleRateThrottle):
    """
    Limita consultas de auditoría a 100 por hora
    Previene scraping de logs sensibles
    """
    scope = 'audit'
    rate = '100/hour'

    def get_cache_key(self, request, view):
        if not request.user.is_authenticated:
            return None  # No aplica a no autenticados (ya bloqueados)

        return self.cache_format % {
            'scope': self.scope,
            'ident': request.user.pk
        }
