from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from django.db import transaction

from src.permissions import TieneRol
from src.models import PerfilUsuario


class UsuariosView(APIView):
    """
    CRUD de usuarios - Solo Administrador TI
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    def get(self, request):
        """Listar todos los usuarios con sus perfiles"""
        usuarios = User.objects.all().order_by('id')
        
        data = []
        for u in usuarios:
            perfil = getattr(u, 'perfil', None)
            data.append({
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "rol": perfil.rol if perfil else None,
                "is_superuser": u.is_superuser,
                "is_active": u.is_active,
            })
        
        return Response(data)

    @transaction.atomic
    def post(self, request):
        """Crear nuevo usuario con perfil"""
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        rol = request.data.get("rol")
        
        # Validaciones
        if not username or not password:
            return Response(
                {"detail": "Username y password son requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "El username ya existe"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Crear perfil si se especificó rol
        if rol:
            PerfilUsuario.objects.create(usuario=user, rol=rol)
        
        return Response({
            "detail": "Usuario creado exitosamente",
            "id": user.id,
            "username": user.username
        }, status=status.HTTP_201_CREATED)


class UsuarioDetailView(APIView):
    """
    Detalle, actualización y eliminación de usuario específico
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    def get(self, request, pk):
        """Obtener detalle de un usuario"""
        try:
            user = User.objects.get(pk=pk)
            perfil = getattr(user, 'perfil', None)
            
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "rol": perfil.rol if perfil else None,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
            })
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

    @transaction.atomic
    def put(self, request, pk):
        """Actualizar usuario y su rol"""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Actualizar campos básicos
        user.email = request.data.get("email", user.email)
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.is_active = request.data.get("is_active", user.is_active)
        
        # Actualizar contraseña si se proporciona
        password = request.data.get("password")
        if password:
            user.set_password(password)
        
        user.save()
        
        # Actualizar o crear perfil
        rol = request.data.get("rol")
        if rol:
            perfil, created = PerfilUsuario.objects.get_or_create(usuario=user)
            perfil.rol = rol
            perfil.save()
        
        return Response({
            "detail": "Usuario actualizado exitosamente",
            "id": user.id,
            "username": user.username
        })

    def delete(self, request, pk):
        """Eliminar usuario"""
        try:
            user = User.objects.get(pk=pk)
            
            # No permitir eliminar al usuario actual
            if user.id == request.user.id:
                return Response(
                    {"detail": "No puedes eliminarte a ti mismo"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            username = user.username
            user.delete()
            
            return Response({
                "detail": f"Usuario {username} eliminado exitosamente"
            })
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
