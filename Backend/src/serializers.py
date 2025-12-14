from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Registro, PerfilUsuario, Calificacion

# =========================
# REGISTROS
# =========================
class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = ['id', 'titulo', 'descripcion', 'fecha']


# =========================
# CALIFICACIONES
# =========================
class CalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = "__all__"
        read_only_fields = (
            "creado_por",
            "fecha_creacion",
            "fecha_actualizacion",
        )


# =========================
# USUARIO (lectura)
# =========================
class UserSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'rol',
            'is_superuser'
        ]


# =========================
# REGISTRO DE USUARIO (PÚBLICO)
# =========================
class RegistroUsuarioSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    rol = serializers.ChoiceField(choices=PerfilUsuario.ROL_CHOICES)

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"]
        )
        user.set_password(validated_data["password"])  # 🔐 HASH
        user.save()

        PerfilUsuario.objects.create(
            user=user,
            rol=validated_data["rol"]
        )

        return user

from django.contrib.auth.hashers import make_password

class RegistroUsuarioSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    rol = serializers.ChoiceField(choices=PerfilUsuario.ROL_CHOICES)

    def create(self, validated_data):
        password = validated_data.pop("password")
        rol = validated_data.pop("rol")

        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            password=make_password(password)  # 🔐 HASH OBLIGATORIO
        )

        PerfilUsuario.objects.create(
            usuario=user,
            rol=rol
        )

        return user

from django.contrib.auth.models import User
from rest_framework import serializers

class PerfilUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]

from src.models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = "__all__"
        read_only_fields = ["usuario", "fecha"]
