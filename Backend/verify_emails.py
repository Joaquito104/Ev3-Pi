#!/usr/bin/env python
"""
Script para verificar manualmente que los emails se envían
Uso: python Backend/manage.py shell < verify_emails.py
"""

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Django.settings')

import django
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
from src.utils_registro import (
    enviar_email_calificacion_creada,
    enviar_email_auditoria_solicitada,
    enviar_email_calificacion_validada
)

print("\n" + "="*60)
print("🧪 VERIFICACIÓN DE CONFIGURACIÓN DE EMAILS")
print("="*60)

# 1. Verificar configuración SMTP
print("\n📧 Configuración SMTP:")
print(f"  EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"  EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"  EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"  EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"  DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

# 2. Intentar enviar email de prueba
print("\n✉️  Enviando email de prueba...")
try:
    result = send_mail(
        'Prueba de Email - Ev3-Pi',
        'Este es un email de prueba del sistema Ev3-Pi',
        settings.DEFAULT_FROM_EMAIL,
        ['test@example.com'],
        fail_silently=False
    )
    print(f"  ✅ Email de prueba enviado exitosamente")
except Exception as e:
    print(f"  ❌ Error: {str(e)}")

# 3. Crear usuario de prueba si no existe
print("\n👤 Preparando usuario de prueba...")
user, created = User.objects.get_or_create(
    username='test_corredor',
    defaults={
        'email': 'corredor@test.local',
        'first_name': 'Test',
        'last_name': 'User'
    }
)
print(f"  Usuario: {user.username} ({user.email})")
if created:
    print(f"  ✅ Usuario creado")
else:
    print(f"  ✅ Usuario existente")

# 4. Probar cada tipo de email
print("\n📬 Probando emails del sistema:")

# Email 1: Calificación Creada
print("\n  1️⃣  Email: Calificación Creada")
try:
    result = enviar_email_calificacion_creada(
        usuario=user,
        rut='12.345.678-9',
        tipo_certificado='AFP',
        solicitar_auditoria=False
    )
    status = "✅ Enviado" if result else "⚠️  Falló"
    print(f"     {status}")
except Exception as e:
    print(f"     ❌ Error: {str(e)}")

# Email 2: Auditoría Solicitada
print("\n  2️⃣  Email: Auditoría Solicitada")
try:
    result = enviar_email_auditoria_solicitada(
        usuario=user,
        rut='12.345.678-9',
        calificacion_id='507f1f77bcf86cd799439011'
    )
    status = "✅ Enviado" if result else "⚠️  Falló"
    print(f"     {status}")
except Exception as e:
    print(f"     ❌ Error: {str(e)}")

# Email 3: Calificación Validada
print("\n  3️⃣  Email: Calificación Validada")
try:
    result = enviar_email_calificacion_validada(
        usuario=user,
        rut='12.345.678-9',
        estado='VALIDADA',
        comentarios='Todo conforme y validado'
    )
    status = "✅ Enviado" if result else "⚠️  Falló"
    print(f"     {status}")
except Exception as e:
    print(f"     ❌ Error: {str(e)}")

# Email 4: Calificación Rechazada
print("\n  4️⃣  Email: Calificación Rechazada")
try:
    result = enviar_email_calificacion_validada(
        usuario=user,
        rut='12.345.678-9',
        estado='RECHAZADA',
        comentarios='Falta información de afiliado'
    )
    status = "✅ Enviado" if result else "⚠️  Falló"
    print(f"     {status}")
except Exception as e:
    print(f"     ❌ Error: {str(e)}")

# Email 5: Calificación Creada con Auditoría
print("\n  5️⃣  Email: Calificación Creada con Auditoría Solicitada")
try:
    result = enviar_email_calificacion_creada(
        usuario=user,
        rut='98.765.432-1',
        tipo_certificado='ISAPRE',
        solicitar_auditoria=True
    )
    status = "✅ Enviado" if result else "⚠️  Falló"
    print(f"     {status}")
except Exception as e:
    print(f"     ❌ Error: {str(e)}")

print("\n" + "="*60)
print("🎯 VERIFICACIÓN COMPLETADA")
print("="*60)
print("\n📝 Notas:")
print("  - Si EMAIL_BACKEND es 'console', los emails se mostrarán en consola")
print("  - Si está configurado con SMTP real, se enviarán a los destinatarios")
print("  - Revisa los logs del servidor para errores de SMTP")
print("\n")
