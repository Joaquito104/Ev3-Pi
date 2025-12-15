"""
Tests de ejemplo para el sistema de gestión tributaria.
Añade más tests según tus necesidades.
"""
import pytest
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


@pytest.mark.unit
class AuthenticationTests(TestCase):
    """Tests de autenticación JWT"""
    
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'password': 'TestPass123!',
            'email': 'test@example.com'
        }
        self.user = User.objects.create_user(**self.user_data)
    
    def test_login_success(self):
        """Test de login exitoso"""
        response = self.client.post('/api/auth/login/', {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_invalid_credentials(self):
        """Test de login con credenciales inválidas"""
        response = self.client.post('/api/auth/login/', {
            'username': self.user_data['username'],
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


@pytest.mark.integration
class RegistroTests(TestCase):
    """Tests del módulo de registros"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='TestPass123!'
        )
        # Obtener token JWT
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'TestPass123!'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
    
    def test_listar_registros_autenticado(self):
        """Test de listado de registros con autenticación"""
        response = self.client.get('/api/registros/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_listar_registros_sin_autenticacion(self):
        """Test de listado sin autenticación"""
        client = APIClient()
        response = client.get('/api/registros/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# Añade más tests según tu lógica de negocio
