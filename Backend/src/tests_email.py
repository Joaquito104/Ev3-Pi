"""
Tests para verificar que los emails se envían correctamente
"""
import os
from django.test import TestCase, override_settings
from django.core.mail import send_mail, outbox
from django.contrib.auth.models import User
from unittest.mock import patch, MagicMock
from src.utils_registro import (
    enviar_email_calificacion_creada,
    enviar_email_auditoria_solicitada,
    enviar_email_calificacion_validada
)


class EmailTestCase(TestCase):
    """Tests para emails del sistema"""
    
    def setUp(self):
        """Preparar datos de test"""
        self.user = User.objects.create_user(
            username='testcorredor',
            email='corredor@test.com',
            first_name='Juan',
            password='testpass123'
        )
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_calificacion_creada(self):
        """Verificar que se envía email cuando se crea calificación"""
        result = enviar_email_calificacion_creada(
            usuario=self.user,
            rut='12.345.678-9',
            tipo_certificado='AFP',
            solicitar_auditoria=False
        )
        
        self.assertTrue(result)
        self.assertEqual(len(outbox), 1)
        self.assertEqual(outbox[0].to, ['corredor@test.com'])
        self.assertIn('Calificación Creada', outbox[0].subject)
        self.assertIn('12.345.678-9', outbox[0].body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_auditoria_solicitada(self):
        """Verificar que se envía email cuando se solicita auditoría"""
        result = enviar_email_auditoria_solicitada(
            usuario=self.user,
            rut='12.345.678-9',
            calificacion_id='507f1f77bcf86cd799439011'
        )
        
        self.assertTrue(result)
        self.assertEqual(len(outbox), 1)
        self.assertEqual(outbox[0].to, ['corredor@test.com'])
        self.assertIn('Solicitud de Auditoría', outbox[0].subject)
        self.assertIn('EN REVISIÓN POR AUDITORÍA', outbox[0].body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_calificacion_validada(self):
        """Verificar que se envía email cuando se valida calificación"""
        result = enviar_email_calificacion_validada(
            usuario=self.user,
            rut='12.345.678-9',
            estado='VALIDADA',
            comentarios='Todo conforme'
        )
        
        self.assertTrue(result)
        self.assertEqual(len(outbox), 1)
        self.assertEqual(outbox[0].to, ['corredor@test.com'])
        self.assertIn('Calificación VALIDADA', outbox[0].subject)
        self.assertIn('Todo conforme', outbox[0].body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_calificacion_rechazada(self):
        """Verificar que se envía email cuando se rechaza calificación"""
        result = enviar_email_calificacion_validada(
            usuario=self.user,
            rut='12.345.678-9',
            estado='RECHAZADA',
            comentarios='Datos incompletos'
        )
        
        self.assertTrue(result)
        self.assertEqual(len(outbox), 1)
        self.assertIn('Calificación RECHAZADA', outbox[0].subject)
        self.assertIn('Datos incompletos', outbox[0].body)
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_email_con_auditoria_solicitada(self):
        """Verificar que email incluye banner cuando se solicita auditoría"""
        result = enviar_email_calificacion_creada(
            usuario=self.user,
            rut='12.345.678-9',
            tipo_certificado='AFP',
            solicitar_auditoria=True
        )
        
        self.assertTrue(result)
        self.assertEqual(len(outbox), 1)
        # Verificar que incluya el banner de auditoría solicitada
        self.assertIn('¡Has solicitado auditoría!', outbox[0].body)


class EmailIntegrationTest(TestCase):
    """Tests de integración con vistas"""
    
    def setUp(self):
        """Preparar datos de test"""
        self.user = User.objects.create_user(
            username='testcorredor',
            email='corredor@test.com',
            first_name='Juan',
            password='testpass123'
        )
    
    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    @patch('src.utils_registro.send_mail')
    def test_email_error_handling(self, mock_send_mail):
        """Verificar que se maneja error en envío de email"""
        mock_send_mail.side_effect = Exception("SMTP Error")
        
        # No debe lanzar excepción, debe devolver False
        result = enviar_email_calificacion_creada(
            usuario=self.user,
            rut='12.345.678-9',
            tipo_certificado='AFP'
        )
        
        self.assertFalse(result)


# Script de prueba manual
if __name__ == '__main__':
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Django.settings')
    django.setup()
    
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2, interactive=True, keepdb=False)
    failures = test_runner.run_tests(["src.tests_email"])
