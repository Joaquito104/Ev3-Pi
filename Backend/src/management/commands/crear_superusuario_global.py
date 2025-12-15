from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from src.models import PerfilUsuario, Auditoria
import os


class Command(BaseCommand):
    help = """
    Crea Administrador Global (Superusuario) para emergencias.

    Este superusuario tiene:
    - Acceso completo a Django Admin
    - Bypass de RBAC en todos los endpoints
    - Acceso a operaciones críticas
    - Auditoría especial de todas sus acciones

    ⚠️ USO RESTRINGIDO SOLO PARA EMERGENCIAS
    """

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='admin_global',
            help='Username del superusuario (default: admin_global)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='admin@nuam.cl',
            help='Email del superusuario'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=None,
            help='Contraseña (si no se provee, se usa variable de entorno ADMIN_PASSWORD)'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password'] or os.getenv('ADMIN_PASSWORD')

        if not password:
            self.stdout.write(self.style.ERROR(
                "❌ ERROR: Debe proporcionar contraseña via --password o variable ADMIN_PASSWORD"
            ))
            return

        # Verificar si ya existe
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(
                f"⚠️  El usuario '{username}' ya existe. No se creará."
            ))
            return

        self.stdout.write(self.style.WARNING("\n🔐 CREANDO ADMINISTRADOR GLOBAL\n"))
        self.stdout.write("=" * 60)

        # Crear superusuario
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        user.first_name = "Administrador"
        user.last_name = "Global"
        user.save()

        # Crear perfil con rol TI (aunque tiene bypass por ser superuser)
        perfil = PerfilUsuario.objects.create(
            usuario=user,
            rol="TI"
        )

        # Auditoría de creación
        Auditoria.objects.create(
            usuario=user,
            rol="SUPERADMIN",
            accion="CREATE",
            modelo="User",
            objeto_id=user.id,
            descripcion=f"Creado Administrador Global '{username}' mediante comando de gestión"
        )

        self.stdout.write("\n")
        self.stdout.write(self.style.SUCCESS("✅ Administrador Global creado exitosamente"))
        self.stdout.write(f"   Username: {username}")
        self.stdout.write(f"   Email: {email}")
        self.stdout.write(f"   Superusuario: Sí")
        self.stdout.write(f"   Rol perfil: TI")
        self.stdout.write("\n")
        self.stdout.write(self.style.WARNING("⚠️  IMPORTANTE:"))
        self.stdout.write("   - Este usuario tiene acceso TOTAL al sistema")
        self.stdout.write("   - Todas sus acciones quedan auditadas")
        self.stdout.write("   - Usar SOLO en emergencias")
        self.stdout.write("   - Cambiar contraseña inmediatamente tras creación")
        self.stdout.write("\n")
        self.stdout.write(self.style.HTTP_INFO("📋 Accesos disponibles:"))
        self.stdout.write(f"   - Django Admin: http://127.0.0.1:8000/admin/")
        self.stdout.write(f"   - Panel Global: http://localhost:5174/admin-global")
        self.stdout.write("=" * 60 + "\n")
