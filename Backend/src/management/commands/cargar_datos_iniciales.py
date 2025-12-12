from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from src.models import PerfilUsuario
from src.rbac import ROLES


class Command(BaseCommand):
    help = "Carga inicial de usuarios, roles y perfiles del sistema NUAM"

    def handle(self, *args, **options):

        usuarios_iniciales = [
            {
                "username": "corredor_test",
                "password": "Corredor123!",
                "rol": ROLES["CORREDOR"],
                "email": "corredor@nuam.cl",
            },
            {
                "username": "analista_test",
                "password": "Analista123!",
                "rol": ROLES["ANALISTA"],
                "email": "analista@nuam.cl",
            },
            {
                "username": "auditor_test",
                "password": "Auditor123!",
                "rol": ROLES["AUDITOR"],
                "email": "auditor@nuam.cl",
            },
            {
                "username": "ti_test",
                "password": "AdminTI123!",
                "rol": ROLES["TI"],
                "email": "ti@nuam.cl",
            },
        ]

        self.stdout.write(self.style.WARNING("\n▶ Cargando usuarios iniciales...\n"))

        for data in usuarios_iniciales:
            user, created = User.objects.get_or_create(
                username=data["username"],
                defaults={"email": data["email"]}
            )

            if created:
                user.set_password(data["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(
                    f"✔ Usuario creado: {data['username']}"
                ))
            else:
                self.stdout.write(
                    f"ℹ Usuario ya existente: {data['username']}"
                )

            perfil, perfil_created = PerfilUsuario.objects.get_or_create(
                usuario=user,
                defaults={"rol": data["rol"]}
            )

            if perfil_created:
                self.stdout.write(
                    f"✔ Perfil asignado: {data['rol']} → {data['username']}"
                )
            else:
                self.stdout.write(
                    f"ℹ Perfil ya existente para {data['username']}"
                )

        # -------------------------
        # SUPERUSUARIO GLOBAL
        # -------------------------
        if not User.objects.filter(username="admin").exists():
            admin = User.objects.create_superuser(
                username="admin",
                password="Admin123!",
                email="admin@nuam.cl"
            )

            PerfilUsuario.objects.create(
                usuario=admin,
                rol=ROLES["ADMIN"]
            )

            self.stdout.write(self.style.SUCCESS(
                "\n✔ Superusuario ADMIN creado correctamente"
            ))
        else:
            self.stdout.write(
                "\nℹ Superusuario ADMIN ya existe"
            )

        self.stdout.write(self.style.SUCCESS(
            "\n✅ Carga de datos iniciales completada sin errores\n"
        ))
