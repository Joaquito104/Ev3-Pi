"""
Utilidades para validación de teléfono y envío de emails
"""
import re
from django.core.mail import send_mail
from django.conf import settings

# Patrones de teléfono por país
PATRONES_TELEFONICO = {
    'CHILE': r'^(\+56|56)?(\s)?(\(9\))?(\s)?[2-9]\d{7,8}$',
    'COLOMBIA': r'^(\+57|57)?(\s)?[2-9]\d{8,9}$',
    'PERU': r'^(\+51|51)?(\s)?\d{8,9}$',
}

# Longitudes aceptadas
LONGITUDES_TELEFONO = {
    'CHILE': (9, 12),    # sin +56 o con +56
    'COLOMBIA': (10, 13),
    'PERU': (8, 11),
}

def validar_telefonico(numero, pais):
    """
    Validar número telefónico según el país
    Retorna (es_valido, numero_normalizado)
    """
    if not numero:
        return False, None
    
    # Remover espacios y caracteres especiales
    numero_limpio = re.sub(r'[\s\-\(\).]', '', numero)
    
    # Verificar longitud
    min_len, max_len = LONGITUDES_TELEFONO.get(pais, (8, 15))
    if len(numero_limpio) < min_len or len(numero_limpio) > max_len:
        return False, None
    
    # Verificar patrón
    patron = PATRONES_TELEFONICO.get(pais)
    if patron and not re.match(patron, numero_limpio):
        return False, None
    
    # Normalizar: agregar prefijo si no lo tiene
    if pais == 'CHILE':
        if numero_limpio.startswith('56'):
            numero_normalizado = f"+{numero_limpio}"
        elif numero_limpio.startswith('+56'):
            numero_normalizado = numero_limpio
        else:
            numero_normalizado = f"+56{numero_limpio}"
    elif pais == 'COLOMBIA':
        if numero_limpio.startswith('57'):
            numero_normalizado = f"+{numero_limpio}"
        elif numero_limpio.startswith('+57'):
            numero_normalizado = numero_limpio
        else:
            numero_normalizado = f"+57{numero_limpio}"
    elif pais == 'PERU':
        if numero_limpio.startswith('51'):
            numero_normalizado = f"+{numero_limpio}"
        elif numero_limpio.startswith('+51'):
            numero_normalizado = numero_limpio
        else:
            numero_normalizado = f"+51{numero_limpio}"
    else:
        numero_normalizado = numero_limpio
    
    return True, numero_normalizado


def enviar_email_verificacion(usuario, email, token):
    """
    Enviar email de verificación
    """
    enlace_verificacion = f"{settings.FRONTEND_URL}/verificar-email?token={token}"
    
    asunto = "Confirma tu email - Ev3-Pi"
    mensaje_html = f"""
    <h2>Bienvenido a Ev3-Pi, {usuario.first_name}!</h2>
    <p>Para completar tu registro, haz clic en el siguiente enlace:</p>
    <p><a href="{enlace_verificacion}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
    ✅ Confirmar Email
    </a></p>
    <p>Este enlace expira en 24 horas.</p>
    <p>Si no solicitaste este registro, ignora este email.</p>
    """
    
    try:
        send_mail(
            asunto,
            f"Confirma tu email: {enlace_verificacion}",  # Versión texto plano
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=mensaje_html,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False


def enviar_email_rol_asignado(usuario, rol):
    """
    Notificar al usuario cuando se asigna un rol
    """
    asunto = "Tu rol ha sido asignado - Ev3-Pi"
    mensaje_html = f"""
    <h2>¡Tu rol ha sido asignado!</h2>
    <p>Hola {usuario.first_name},</p>
    <p>Tu rol en el sistema es: <strong>{rol}</strong></p>
    <p>Ya puedes iniciar sesión y acceder a tu dashboard.</p>
    """
    
    try:
        send_mail(
            asunto,
            f"Tu rol: {rol}",
            settings.DEFAULT_FROM_EMAIL,
            [usuario.email],
            html_message=mensaje_html,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False
