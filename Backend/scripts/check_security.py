"""
Verificador de Configuración de Seguridad

Verifica que todas las configuraciones de seguridad estén correctamente
configuradas según OWASP y NIST.

Uso:
    python Backend/manage.py shell < Backend/scripts/check_security.py

O desde terminal:
    cd Backend
    python scripts/check_security.py
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Django.settings')
django.setup()

from django.conf import settings
from django.contrib.auth.models import User
from src.validators import SecurityValidator

class SecurityChecker:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.passed = []
    
    def check(self, category, test_name, condition, severity='error', recommendation=''):
        """
        Registra resultado de una verificación
        
        Args:
            category (str): Categoría (HTTPS, Auth, etc.)
            test_name (str): Nombre del test
            condition (bool): True si pasa el test
            severity (str): 'error', 'warning', 'info'
            recommendation (str): Recomendación si falla
        """
        result = {
            'category': category,
            'test': test_name,
            'recommendation': recommendation
        }
        
        if condition:
            self.passed.append(result)
            print(f"✅ [{category}] {test_name}")
        else:
            if severity == 'error':
                self.issues.append(result)
                print(f"❌ [{category}] {test_name}")
            else:
                self.warnings.append(result)
                print(f"⚠️  [{category}] {test_name}")
            
            if recommendation:
                print(f"   💡 {recommendation}")
    
    def check_https(self):
        """Verificar configuración HTTPS"""
        print("\n🔐 HTTPS y SSL/TLS")
        print("-" * 60)
        
        self.check(
            'HTTPS',
            'DEBUG está desactivado',
            not settings.DEBUG,
            'error',
            'Establecer DEBUG=False en producción'
        )
        
        self.check(
            'HTTPS',
            'SSL redirect habilitado',
            getattr(settings, 'SECURE_SSL_REDIRECT', False),
            'error',
            'Establecer SECURE_SSL_REDIRECT=True en .env'
        )
        
        self.check(
            'HTTPS',
            'HSTS configurado (1 año mínimo)',
            getattr(settings, 'SECURE_HSTS_SECONDS', 0) >= 31536000,
            'error',
            'Establecer SECURE_HSTS_SECONDS=31536000 (1 año)'
        )
        
        self.check(
            'HTTPS',
            'HSTS incluye subdominios',
            getattr(settings, 'SECURE_HSTS_INCLUDE_SUBDOMAINS', False),
            'warning',
            'Establecer SECURE_HSTS_INCLUDE_SUBDOMAINS=True'
        )
        
        self.check(
            'HTTPS',
            'HSTS preload habilitado',
            getattr(settings, 'SECURE_HSTS_PRELOAD', False),
            'warning',
            'Establecer SECURE_HSTS_PRELOAD=True'
        )
    
    def check_cookies(self):
        """Verificar configuración de cookies"""
        print("\n🍪 Cookies y Sesiones")
        print("-" * 60)
        
        self.check(
            'Cookies',
            'Session cookie secure',
            getattr(settings, 'SESSION_COOKIE_SECURE', False),
            'error',
            'Establecer SESSION_COOKIE_SECURE=True'
        )
        
        self.check(
            'Cookies',
            'CSRF cookie secure',
            getattr(settings, 'CSRF_COOKIE_SECURE', False),
            'error',
            'Establecer CSRF_COOKIE_SECURE=True'
        )
        
        self.check(
            'Cookies',
            'Session cookie HttpOnly',
            getattr(settings, 'SESSION_COOKIE_HTTPONLY', True),
            'error',
            'Establecer SESSION_COOKIE_HTTPONLY=True'
        )
        
        self.check(
            'Cookies',
            'Session cookie SameSite',
            getattr(settings, 'SESSION_COOKIE_SAMESITE', None) in ['Lax', 'Strict'],
            'warning',
            "Establecer SESSION_COOKIE_SAMESITE='Lax'"
        )
        
        self.check(
            'Cookies',
            'CSRF cookie SameSite',
            getattr(settings, 'CSRF_COOKIE_SAMESITE', None) in ['Lax', 'Strict'],
            'warning',
            "Establecer CSRF_COOKIE_SAMESITE='Lax'"
        )
    
    def check_headers(self):
        """Verificar security headers"""
        print("\n📋 Security Headers")
        print("-" * 60)
        
        self.check(
            'Headers',
            'X-Content-Type-Options nosniff',
            getattr(settings, 'SECURE_CONTENT_TYPE_NOSNIFF', False),
            'error',
            'Establecer SECURE_CONTENT_TYPE_NOSNIFF=True'
        )
        
        self.check(
            'Headers',
            'X-Frame-Options',
            getattr(settings, 'X_FRAME_OPTIONS', None) in ['DENY', 'SAMEORIGIN'],
            'error',
            "Establecer X_FRAME_OPTIONS='DENY'"
        )
        
        self.check(
            'Headers',
            'X-XSS-Protection',
            getattr(settings, 'SECURE_BROWSER_XSS_FILTER', False),
            'warning',
            'Establecer SECURE_BROWSER_XSS_FILTER=True'
        )
    
    def check_passwords(self):
        """Verificar configuración de contraseñas"""
        print("\n🔑 Contraseñas")
        print("-" * 60)
        
        password_hashers = getattr(settings, 'PASSWORD_HASHERS', [])
        
        self.check(
            'Passwords',
            'Argon2 como hasher primario',
            len(password_hashers) > 0 and 'Argon2' in password_hashers[0],
            'warning',
            'Configurar Argon2PasswordHasher como primer hasher'
        )
        
        validators = getattr(settings, 'AUTH_PASSWORD_VALIDATORS', [])
        
        self.check(
            'Passwords',
            'Validador de longitud mínima',
            any('MinimumLengthValidator' in str(v) for v in validators),
            'error',
            'Agregar MinimumLengthValidator (mínimo 8 caracteres)'
        )
        
        self.check(
            'Passwords',
            'Validador de contraseñas comunes',
            any('CommonPasswordValidator' in str(v) for v in validators),
            'warning',
            'Agregar CommonPasswordValidator'
        )
        
        # Verificar credenciales débiles
        weak_users = []
        for username, password in [('admin', 'admin'), ('test', 'test123')]:
            try:
                user = User.objects.get(username=username)
                if user.check_password(password):
                    weak_users.append(username)
            except User.DoesNotExist:
                pass
        
        self.check(
            'Passwords',
            'Sin credenciales por defecto',
            len(weak_users) == 0,
            'error',
            f'Cambiar contraseñas de: {", ".join(weak_users)}. Ejecutar scripts/cambiar_credenciales.py'
        )
    
    def check_rate_limiting(self):
        """Verificar rate limiting"""
        print("\n⏱️  Rate Limiting")
        print("-" * 60)
        
        rest_framework = getattr(settings, 'REST_FRAMEWORK', {})
        
        throttle_classes = rest_framework.get('DEFAULT_THROTTLE_CLASSES', [])
        throttle_rates = rest_framework.get('DEFAULT_THROTTLE_RATES', {})
        
        self.check(
            'Rate Limit',
            'Throttling habilitado',
            len(throttle_classes) > 0,
            'error',
            'Configurar DEFAULT_THROTTLE_CLASSES en REST_FRAMEWORK'
        )
        
        self.check(
            'Rate Limit',
            'Límite para usuarios anónimos',
            'anon' in throttle_rates,
            'error',
            "Configurar throttle_rates: {'anon': '100/hour'}"
        )
        
        self.check(
            'Rate Limit',
            'Límite para usuarios autenticados',
            'user' in throttle_rates,
            'error',
            "Configurar throttle_rates: {'user': '1000/hour'}"
        )
        
        self.check(
            'Rate Limit',
            'Límite para login',
            'login' in throttle_rates,
            'error',
            "Configurar throttle_rates: {'login': '5/minute'}"
        )
    
    def check_cors(self):
        """Verificar configuración CORS"""
        print("\n🌐 CORS")
        print("-" * 60)
        
        self.check(
            'CORS',
            'CORS_ALLOW_ALL_ORIGINS desactivado',
            not getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False),
            'error',
            'Establecer CORS_ALLOW_ALL_ORIGINS=False'
        )
        
        allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
        
        self.check(
            'CORS',
            'Orígenes permitidos configurados',
            len(allowed_origins) > 0,
            'warning',
            'Configurar CORS_ALLOWED_ORIGINS con dominios específicos'
        )
        
        self.check(
            'CORS',
            'Sin wildcard en orígenes',
            not any('*' in origin for origin in allowed_origins),
            'error',
            'Eliminar wildcards de CORS_ALLOWED_ORIGINS'
        )
    
    def check_secret_key(self):
        """Verificar SECRET_KEY"""
        print("\n🔐 SECRET_KEY")
        print("-" * 60)
        
        secret_key = settings.SECRET_KEY
        
        self.check(
            'Secret',
            'SECRET_KEY suficientemente largo',
            len(secret_key) >= 50,
            'error',
            'Generar SECRET_KEY de 50+ caracteres'
        )
        
        self.check(
            'Secret',
            'SECRET_KEY no es valor por defecto',
            'django-insecure' not in secret_key.lower(),
            'error',
            'Cambiar SECRET_KEY generado por defecto'
        )
        
        # Verificar que no esté en control de versiones
        if os.path.exists('.env'):
            with open('.env', 'r') as f:
                env_content = f.read()
                self.check(
                    'Secret',
                    'SECRET_KEY en .env (no en código)',
                    'SECRET_KEY' in env_content,
                    'error',
                    'Mover SECRET_KEY a archivo .env'
                )
    
    def check_database(self):
        """Verificar configuración de base de datos"""
        print("\n💾 Base de Datos")
        print("-" * 60)
        
        db_config = settings.DATABASES.get('default', {})
        
        self.check(
            'Database',
            'Base de datos no usa SQLite en producción',
            not (db_config.get('ENGINE', '').endswith('sqlite3') and not settings.DEBUG),
            'error',
            'Usar PostgreSQL en producción'
        )
        
        # Verificar credenciales débiles
        db_password = db_config.get('PASSWORD', '')
        
        weak_passwords = ['admin', 'password', '123456', 'root']
        self.check(
            'Database',
            'Contraseña de BD no es débil',
            db_password not in weak_passwords and len(db_password) >= 12,
            'error',
            'Usar contraseña fuerte de 12+ caracteres para la base de datos'
        )
    
    def check_logging(self):
        """Verificar configuración de logging"""
        print("\n📝 Logging")
        print("-" * 60)
        
        logging_config = getattr(settings, 'LOGGING', {})
        
        self.check(
            'Logging',
            'Logging configurado',
            len(logging_config) > 0,
            'warning',
            'Configurar LOGGING para eventos de seguridad'
        )
        
        loggers = logging_config.get('loggers', {})
        
        self.check(
            'Logging',
            'Logger de seguridad configurado',
            'security' in loggers or 'django.security' in loggers,
            'warning',
            'Agregar logger específico para eventos de seguridad'
        )
    
    def print_summary(self):
        """Imprime resumen de resultados"""
        print("\n" + "=" * 60)
        print("📊 RESUMEN")
        print("=" * 60)
        
        total = len(self.passed) + len(self.issues) + len(self.warnings)
        
        print(f"\n✅ Aprobados: {len(self.passed)}/{total}")
        print(f"❌ Errores críticos: {len(self.issues)}")
        print(f"⚠️  Advertencias: {len(self.warnings)}")
        
        score = (len(self.passed) / total * 100) if total > 0 else 0
        print(f"\n📈 Puntuación de seguridad: {score:.1f}%")
        
        if score >= 95:
            print("🏆 Excelente - Listo para producción")
        elif score >= 80:
            print("👍 Bueno - Revisar advertencias")
        elif score >= 60:
            print("⚠️  Regular - Corregir errores críticos")
        else:
            print("❌ Insuficiente - Requiere trabajo urgente")
        
        if self.issues:
            print("\n" + "=" * 60)
            print("🚨 ERRORES CRÍTICOS A CORREGIR")
            print("=" * 60)
            for issue in self.issues:
                print(f"\n❌ [{issue['category']}] {issue['test']}")
                if issue['recommendation']:
                    print(f"   💡 {issue['recommendation']}")
        
        if self.warnings:
            print("\n" + "=" * 60)
            print("⚠️  ADVERTENCIAS")
            print("=" * 60)
            for warning in self.warnings:
                print(f"\n⚠️  [{warning['category']}] {warning['test']}")
                if warning['recommendation']:
                    print(f"   💡 {warning['recommendation']}")

def main():
    print("=" * 60)
    print("🔒 VERIFICADOR DE SEGURIDAD PROYECTO")
    print("=" * 60)
    print(f"\nModo: {'🔴 PRODUCCIÓN' if not settings.DEBUG else '🟡 DESARROLLO'}")
    print(f"Django: {django.get_version()}")
    
    checker = SecurityChecker()
    
    # Ejecutar todas las verificaciones
    checker.check_https()
    checker.check_cookies()
    checker.check_headers()
    checker.check_passwords()
    checker.check_rate_limiting()
    checker.check_cors()
    checker.check_secret_key()
    checker.check_database()
    checker.check_logging()
    
    # Mostrar resumen
    checker.print_summary()
    
    print("\n" + "=" * 60)
    print("📚 Documentación:")
    print("   - OWASP Top 10: https://owasp.org/Top10/")
    print("   - DEPLOY.md: Guía completa de despliegue")
    print("   - .env.example: Plantilla de configuración")
    print("=" * 60)

if __name__ == '__main__':
    main()
