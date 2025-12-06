from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Registro, PerfilUsuario

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = ['id', 'titulo', 'descripcion', 'fecha']


class UserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)  # ← bien
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'rol', 'is_superuser']
