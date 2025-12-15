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

    asunto = "Confirma tu email - Proyecto"
    mensaje_html = f"""
    <h2>Bienvenido a Proyecto, {usuario.first_name}!</h2>
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
    asunto = "Tu rol ha sido asignado - Proyecto"
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

def enviar_email_caso_soporte(caso_soporte):
    """
    Enviar email de confirmación cuando se crea un caso de soporte
    """
    asunto = f"✅ Caso de Soporte Creado - {caso_soporte.id_caso}"

    mensaje_html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0b1220;">✅ Tu caso ha sido registrado</h2>

            <p style="color: #333;">Hola <strong>{caso_soporte.nombre}</strong>,</p>

            <p style="color: #333;">Hemos recibido tu {caso_soporte.get_tipo_display().lower()} y te contactaremos pronto para atender tu inquietud.</p>

            <div style="background-color: #f0f7ff; border-left: 4px solid #0084ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 5px 0; color: #0b1220;"><strong>📋 ID del Caso:</strong> {caso_soporte.id_caso}</p>
                <p style="margin: 5px 0; color: #0b1220;"><strong>📌 Asunto:</strong> {caso_soporte.titulo}</p>
                <p style="margin: 5px 0; color: #0b1220;"><strong>⏱️ Tipo:</strong> {caso_soporte.get_tipo_display()}</p>
                <p style="margin: 5px 0; color: #0b1220;"><strong>🎯 Prioridad:</strong> {caso_soporte.get_prioridad_display()}</p>
            </div>

            <p style="color: #666;">Un miembro del equipo de soporte se pondrá en contacto contigo en breve a través de este correo para resolver tu inquietud.</p>

            <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <strong>Información del caso:</strong><br>
                Fecha de creación: {caso_soporte.fecha_creacion.strftime('%d/%m/%Y %H:%M')}<br>
                Estado: {caso_soporte.get_estado_display()}<br>
                Email de contacto: {caso_soporte.email}
            </p>

            <p style="color: #999; font-size: 12px; margin-top: 20px;">
                Este es un correo automático. Por favor no respondas a este mensaje directamente.
                Guarda el ID del caso (<strong>{caso_soporte.id_caso}</strong>) para referencia futura.
            </p>
        </div>
    </div>
    """

    try:
        send_mail(
            asunto,
            f"Tu caso {caso_soporte.id_caso} ha sido registrado",
            settings.DEFAULT_FROM_EMAIL,
            [caso_soporte.email],
            html_message=mensaje_html,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error enviando email de caso soporte: {e}")
        return False


def enviar_email_calificacion_creada(usuario, rut, tipo_certificado, solicitar_auditoria=False):
    """
    Notificar cuando se crea una nueva calificación
    """
    asunto = "Nueva Calificación Creada - Proyecto"

    auditoria_html = ""
    if solicitar_auditoria:
        auditoria_html = """
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 0; color: #856404;"><strong>🔍 ¡Has solicitado auditoría!</strong></p>
            <p style="margin: 5px 0; color: #856404; font-size: 14px;">Un auditor revisará esta calificación próximamente.</p>
        </div>
        """

    mensaje_html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0b1220;">✅ Calificación Creada</h2>

            <p style="color: #333;">Hola <strong>{usuario.first_name}</strong>,</p>

            <p style="color: #333;">Tu calificación ha sido creada exitosamente en el sistema.</p>

            <div style="background-color: #f0f7ff; border-left: 4px solid #0084ff; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 5px 0; color: #0b1220;"><strong>📄 RUT:</strong> {rut}</p>
                <p style="margin: 5px 0; color: #0b1220;"><strong>🏷️ Tipo:</strong> {tipo_certificado}</p>
                <p style="margin: 5px 0; color: #0b1220;"><strong>📊 Estado:</strong> BORRADOR</p>
            </div>

            {auditoria_html}

            <p style="color: #666; margin: 20px 0;">Puedes ver el detalle de tu calificación en tu dashboard.</p>

            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Este es un correo automático. Por favor no respondas a este mensaje directamente.
            </p>
        </div>
    </div>
    """

    try:
        send_mail(
            asunto,
            f"Tu calificación para {rut} ha sido creada",
            settings.DEFAULT_FROM_EMAIL,
            [usuario.email],
            html_message=mensaje_html,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error enviando email de calificación creada: {e}")
        return False


def enviar_email_auditoria_solicitada(usuario, rut, calificacion_id):
    """
    Notificar cuando se solicita auditoría de una calificación
    """
    asunto = "Solicitud de Auditoría Registrada - Proyecto"

    mensaje_html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0b1220;">🔍 Solicitud de Auditoría</h2>

            <p style="color: #333;">Hola <strong>{usuario.first_name}</strong>,</p>

            <p style="color: #333;">Hemos registrado tu solicitud de auditoría para la calificación. Un auditor especializado revisará tu caso próximamente.</p>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 5px 0; color: #856404;"><strong>📄 RUT:</strong> {rut}</p>
                <p style="margin: 5px 0; color: #856404;"><strong>📋 ID Calificación:</strong> {calificacion_id}</p>
                <p style="margin: 5px 0; color: #856404;"><strong>⏱️ Estado:</strong> EN REVISIÓN POR AUDITORÍA</p>
            </div>

            <p style="color: #666; margin: 20px 0;">Te enviaremos un correo tan pronto como el auditor complete la revisión. Te mantendremos informado en cada paso del proceso.</p>

            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Este es un correo automático. Por favor no respondas a este mensaje directamente.
            </p>
        </div>
    </div>
    """

    try:
        send_mail(
            asunto,
            f"Tu solicitud de auditoría para {rut} ha sido registrada",
            settings.DEFAULT_FROM_EMAIL,
            [usuario.email],
            html_message=mensaje_html,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error enviando email de auditoría solicitada: {e}")
        return False


def enviar_email_calificacion_validada(usuario, rut, estado, comentarios=""):
    """
    Notificar cuando se valida una calificación
    """
    color_estado = "#28a745" if estado == "VALIDADA" else "#dc3545"
    icono_estado = "✅" if estado == "VALIDADA" else "⚠️"

    asunto = f"{icono_estado} Calificación {estado} - Proyecto"

    comentarios_html = ""
    if comentarios:
        comentarios_html = f"""
        <div style="background-color: #f8f9fa; border-left: 4px solid #6c757d; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <p style="margin: 5px 0; color: #333;"><strong>💬 Comentarios del Auditor:</strong></p>
            <p style="margin: 5px 0; color: #666;">{comentarios}</p>
        </div>
        """

    mensaje_html = f"""
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: {color_estado};">{icono_estado} Calificación {estado}</h2>

            <p style="color: #333;">Hola <strong>{usuario.first_name}</strong>,</p>

            <p style="color: #333;">Tu calificación ha sido revisada y validada por nuestro equipo de auditoría.</p>

            <div style="background-color: #f0f7ff; border-left: 4px solid {color_estado}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 5px 0; color: #0b1220;"><strong>📄 RUT:</strong> {rut}</p>
                <p style="margin: 5px 0; color: #0b1220;"><strong>📊 Estado:</strong> {estado}</p>
            </div>

            {comentarios_html}

            <p style="color: #666; margin: 20px 0;">Puedes ver el detalle completo en tu dashboard.</p>

            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Este es un correo automático. Por favor no respondas a este mensaje directamente.
            </p>
        </div>
    </div>
    """

    try:
        send_mail(
            asunto,
            f"Tu calificación para {rut} ha sido {estado.lower()}",
            settings.DEFAULT_FROM_EMAIL,
            [usuario.email],
            html_message=mensaje_html,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error enviando email de calificación validada: {e}")
        return False