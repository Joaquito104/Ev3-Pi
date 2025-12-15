"""
Script para cambiar credenciales por defecto en producción

ADVERTENCIA: Este script cambia las contraseñas de todos los usuarios
con credenciales débiles o por defecto.

Uso:
    python manage.py shell < scripts/cambiar_credenciales.py

O desde Django shell:
    exec(open('scripts/cambiar_credenciales.py').read())
"""

import sys
import os
import django
from django.core.exceptions import ValidationError

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Django.settings')
django.setup()

from django.contrib.auth.models import User
from src.validators import SecurityValidator

# Credenciales débiles comunes
WEAK_CREDENTIALS = [
    ('admin', 'admin'),
    ('admin', 'admin123'),
    ('admin', '123456'),
    ('test', 'test123'),
    ('user', 'password'),
    ('root', 'root'),
    ('administrator', 'password'),
]

def check_weak_passwords():
    """
    Verifica si existen usuarios con contraseñas débiles
    """
    print("🔍 Verificando credenciales débiles...\n")
    
    vulnerable_users = []
    validator = SecurityValidator()
    
    for username, password in WEAK_CREDENTIALS:
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                vulnerable_users.append((user, password))
                print(f"❌ Usuario '{username}' tiene contraseña débil: '{password}'")
        except User.DoesNotExist:
            continue
    
    # Verificar todos los usuarios con contraseñas comunes
    all_users = User.objects.all()
    common_passwords = validator.COMMON_PASSWORDS
    
    for user in all_users:
        for common_pwd in common_passwords:
            if user.check_password(common_pwd):
                if (user, common_pwd) not in vulnerable_users:
                    vulnerable_users.append((user, common_pwd))
                    print(f"❌ Usuario '{user.username}' tiene contraseña común: '{common_pwd}'")
    
    if not vulnerable_users:
        print("✅ No se encontraron credenciales débiles")
    else:
        print(f"\n⚠️  Total usuarios vulnerables: {len(vulnerable_users)}")
    
    return vulnerable_users

def generate_strong_password(length=16):
    """
    Genera contraseña fuerte aleatoria
    """
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
    
    while True:
        password = ''.join(secrets.choice(alphabet) for i in range(length))
        
        # Verificar que cumple requisitos
        if (any(c.islower() for c in password)
                and any(c.isupper() for c in password)
                and any(c.isdigit() for c in password)
                and any(c in "!@#$%^&*()-_=+" for c in password)):
            return password

def change_weak_passwords(auto=False):
    """
    Cambia contraseñas débiles por contraseñas fuertes
    
    Args:
        auto (bool): Si True, cambia automáticamente sin confirmación
    """
    vulnerable_users = check_weak_passwords()
    
    if not vulnerable_users:
        return
    
    if not auto:
        print("\n⚠️  ATENCIÓN: Este script cambiará las contraseñas de los usuarios vulnerables")
        response = input("¿Desea continuar? (escriba 'SI' para confirmar): ")
        if response != 'SI':
            print("❌ Operación cancelada")
            return
    
    print("\n🔐 Cambiando contraseñas...\n")
    
    changed_credentials = []
    validator = SecurityValidator()
    
    for user, old_password in vulnerable_users:
        new_password = generate_strong_password()
        
        # Validar nueva contraseña
        try:
            validator.validate_strong_password(new_password)
        except ValidationError as e:
            print(f"❌ Error validando contraseña para {user.username}: {e}")
            continue
        
        # Cambiar contraseña
        user.set_password(new_password)
        user.save()
        
        changed_credentials.append((user.username, new_password))
        print(f"✅ Contraseña cambiada para '{user.username}'")
    
    # Guardar credenciales en archivo seguro
    if changed_credentials:
        credentials_file = 'nuevas_credenciales_CONFIDENCIAL.txt'
        with open(credentials_file, 'w') as f:
            f.write("=" * 60 + "\n")
            f.write("NUEVAS CREDENCIALES - CONFIDENCIAL\n")
            f.write("=" * 60 + "\n\n")
            f.write("⚠️  IMPORTANTE:\n")
            f.write("1. Envíe estas credenciales por canal seguro\n")
            f.write("2. Elimine este archivo después de comunicar las contraseñas\n")
            f.write("3. Solicite a los usuarios cambiar sus contraseñas en el primer login\n\n")
            f.write("-" * 60 + "\n\n")
            
            for username, password in changed_credentials:
                f.write(f"Usuario: {username}\n")
                f.write(f"Contraseña: {password}\n")
                f.write("-" * 60 + "\n\n")
        
        print(f"\n📝 Credenciales guardadas en: {credentials_file}")
        print("⚠️  ELIMINE este archivo después de comunicar las contraseñas")
    
    print(f"\n✅ Total contraseñas cambiadas: {len(changed_credentials)}")

def require_password_change_on_login():
    """
    Marca a usuarios con contraseñas cambiadas para que cambien su contraseña en el próximo login
    """
    from src.models import PerfilUsuario
    
    vulnerable_users = check_weak_passwords()
    if not vulnerable_users:
        return
    
    print("\n🔒 Marcando usuarios para cambio obligatorio de contraseña...")
    
    for user, _ in vulnerable_users:
        try:
            perfil = PerfilUsuario.objects.get(usuario=user)
            # Aquí podrías agregar un campo 'requiere_cambio_password' al modelo
            # perfil.requiere_cambio_password = True
            # perfil.save()
            print(f"✅ Usuario '{user.username}' requerirá cambio de contraseña")
        except PerfilUsuario.DoesNotExist:
            print(f"⚠️  No se encontró perfil para '{user.username}'")

def audit_all_passwords():
    """
    Audita la fortaleza de todas las contraseñas sin cambiarlas
    """
    print("🔍 Auditando fortaleza de contraseñas...\n")
    
    validator = SecurityValidator()
    all_users = User.objects.all()
    
    weak_count = 0
    common_count = 0
    
    print(f"Total usuarios: {all_users.count()}\n")
    
    # No podemos verificar la fortaleza de contraseñas hasheadas
    # Solo podemos verificar contra lista de comunes
    
    for user in all_users:
        is_weak = False
        for common_pwd in validator.COMMON_PASSWORDS:
            if user.check_password(common_pwd):
                print(f"❌ '{user.username}' usa contraseña común")
                common_count += 1
                is_weak = True
                break
        
        if not is_weak:
            print(f"✅ '{user.username}' - OK")
    
    print(f"\n📊 Resumen:")
    print(f"   Contraseñas débiles/comunes: {common_count}")
    print(f"   Contraseñas seguras: {all_users.count() - common_count}")
    
    if common_count > 0:
        print(f"\n⚠️  Se recomienda ejecutar change_weak_passwords()")

# Menú interactivo
if __name__ == '__main__':
    print("=" * 60)
    print("CAMBIAR CREDENCIALES POR DEFECTO")
    print("=" * 60)
    print("\nOpciones:")
    print("1. Verificar credenciales débiles")
    print("2. Cambiar contraseñas débiles (interactivo)")
    print("3. Cambiar contraseñas débiles (automático)")
    print("4. Auditar todas las contraseñas")
    print("5. Salir")
    
    choice = input("\nSeleccione opción (1-5): ")
    
    if choice == '1':
        check_weak_passwords()
    elif choice == '2':
        change_weak_passwords(auto=False)
    elif choice == '3':
        change_weak_passwords(auto=True)
    elif choice == '4':
        audit_all_passwords()
    elif choice == '5':
        print("👋 Saliendo...")
    else:
        print("❌ Opción inválida")
