from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import transaction

from src.serializers import RegistroUsuarioSerializer
from src.models import PerfilUsuario, VerificacionEmail, PAISES_CHOICES, CorreoAdicional, Auditoria
from src.utils_registro import validar_telefonico, enviar_email_verificacion, enviar_email_rol_asignado


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mi_perfil(request):
    perfil = getattr(request.user, "perfil", None)
    rol = perfil.rol if perfil else None

    if request.user.is_superuser and not rol:
        rol = "TI"

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "email": request.user.email,
        "rol": rol,
        "is_superuser": request.user.is_superuser,
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def registrar_usuario(request):
    serializer = RegistroUsuarioSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Usuario creado correctamente"},
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegistroView(APIView):
    """
    Registro completo de usuario con:
    - Nombre, apellido, email
    - Teléfono validado por país
    - Selección de rol
    - Verificación de email
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Crear nuevo usuario y enviar email de verificación"""
        
        # Validar datos requeridos
        username = request.data.get('username', '').strip()
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password')
        password_confirm = request.data.get('password_confirm')
        pais = request.data.get('pais', 'CHILE').upper()
        telefono = request.data.get('telefono', '').strip()
        rol_solicitado = request.data.get('rol')

        # Validaciones básicas
        if not all([username, first_name, last_name, email, password, telefono, rol_solicitado]):
            return Response(
                {"detail": "Todos los campos son obligatorios"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if password != password_confirm:
            return Response(
                {"detail": "Las contraseñas no coinciden"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 8:
            return Response(
                {"detail": "La contraseña debe tener al menos 8 caracteres"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pais not in dict(PAISES_CHOICES):
            return Response(
                {"detail": f"País no válido. Opciones: {', '.join([p[0] for p in PAISES_CHOICES])}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar teléfono
        es_valido, telefono_normalizado = validar_telefonico(telefono, pais)
        if not es_valido:
            return Response(
                {"detail": f"Número telefónico inválido para {pais}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar rol
        roles_validos = dict(PerfilUsuario.ROL_CHOICES)
        if rol_solicitado not in roles_validos:
            return Response(
                {"detail": "Rol no válido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar si usuario o email ya existe
        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Este usuario ya existe"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Este email ya está registrado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear usuario en una transacción
        try:
            with transaction.atomic():
                # Crear usuario
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=False  # Inactivo hasta verificar email
                )

                # Crear perfil
                perfil = PerfilUsuario.objects.create(
                    usuario=user,
                    rol=rol_solicitado,
                    telefono=telefono_normalizado,
                    pais=pais
                )

                # Crear correo adicional principal
                CorreoAdicional.objects.create(
                    usuario=user,
                    email=email,
                    verificado=False,
                    principal=True
                )

                # Generar token de verificación
                token = VerificacionEmail.generar_token()
                verificacion = VerificacionEmail.objects.create(
                    usuario=user,
                    token=token,
                    email_a_verificar=email
                )

                # Auditar
                Auditoria.objects.create(
                    usuario=user,
                    rol=rol_solicitado,
                    accion="CREATE",
                    modelo="User",
                    objeto_id=user.id,
                    descripcion=f"Usuario registrado: {username} ({rol_solicitado})",
                    metadatos={
                        "pais": pais,
                        "email": email
                    }
                )

                # Enviar email de verificación
                if not enviar_email_verificacion(user, email, token):
                    return Response(
                        {"detail": "Usuario creado pero fallo enviar email. Intenta recuperar contraseña."},
                        status=status.HTTP_201_CREATED
                    )

                return Response({
                    "detail": "Usuario registrado. Verifica tu email para completar el registro",
                    "usuario": {
                        "id": user.id,
                        "username": username,
                        "email": email,
                        "rol": rol_solicitado,
                        "pais": pais
                    }
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": f"Error al registrar: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerificarEmailView(APIView):
    """
    Verificar email con token
    Activar usuario después de verificación
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Verificar email con token"""
        token = request.data.get('token')

        if not token:
            return Response(
                {"detail": "Token es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            verificacion = VerificacionEmail.objects.get(token=token)
        except VerificacionEmail.DoesNotExist:
            return Response(
                {"detail": "Token inválido"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar si ya fue verificado
        if verificacion.verificado:
            return Response(
                {"detail": "Este email ya fue verificado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar si el token expiró
        if not verificacion.es_valido():
            return Response(
                {"detail": "Token expirado. Solicita un nuevo enlace."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Activar usuario
        user = verificacion.usuario
        user.is_active = True
        user.save()

        # Marcar como verificado
        verificacion.verificado = True
        verificacion.fecha_verificacion = timezone.now()
        verificacion.save()

        # Marcar correo como verificado
        try:
            correo = CorreoAdicional.objects.get(
                usuario=user,
                email=verificacion.email_a_verificar
            )
            correo.verificado = True
            correo.save()
        except CorreoAdicional.DoesNotExist:
            pass

        # Auditar
        Auditoria.objects.create(
            usuario=user,
            rol=user.perfil.rol,
            accion="UPDATE",
            modelo="User",
            objeto_id=user.id,
            descripcion="Email verificado - Usuario activado",
            metadatos={"email": user.email}
        )

        # Enviar email de confirmación de rol asignado
        enviar_email_rol_asignado(user, user.perfil.get_rol_display())

        return Response({
            "detail": "Email verificado correctamente. Ya puedes iniciar sesión.",
            "usuario": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "rol": user.perfil.rol
            }
        })


class ReenviarVerificacionView(APIView):
    """
    Reenviar email de verificación
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Reenviar token de verificación"""
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response(
                {"detail": "Email es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Si ya está activo
        if user.is_active:
            return Response(
                {"detail": "Este usuario ya está verificado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener o crear verificación
        try:
            verificacion = VerificacionEmail.objects.get(usuario=user)
            # Si el anterior no expiró, usa el mismo token
            if verificacion.es_valido():
                token = verificacion.token
            else:
                # Crear nuevo token
                verificacion.delete()
                token = VerificacionEmail.generar_token()
                verificacion = VerificacionEmail.objects.create(
                    usuario=user,
                    token=token,
                    email_a_verificar=email
                )
        except VerificacionEmail.DoesNotExist:
            token = VerificacionEmail.generar_token()
            verificacion = VerificacionEmail.objects.create(
                usuario=user,
                token=token,
                email_a_verificar=email
            )

        # Enviar email
        if enviar_email_verificacion(user, email, token):
            return Response({
                "detail": "Email de verificación enviado. Revisa tu bandeja de entrada."
            })
        else:
            return Response(
                {"detail": "Error al enviar email"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
