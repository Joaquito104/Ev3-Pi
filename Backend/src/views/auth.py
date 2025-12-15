from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
import pyotp
import redis
import json

from src.serializers import RegistroUsuarioSerializer
from src.models import PerfilUsuario, VerificacionEmail, PAISES_CHOICES, CorreoAdicional, Auditoria
from src.utils_registro import validar_telefonico, enviar_email_verificacion, enviar_email_rol_asignado

# Redis para almacenar códigos MFA temporales
try:
    r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    r.ping()
except:
    r = None  # Sin Redis, MFA temporal en memoria


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

class LoginMFAView(APIView):
    """
    Login con MFA en 2 pasos:
    1. POST con username/password → Retorna session_id (temporal)
    2. POST con session_id y codigo_mfa → Retorna access/refresh tokens
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Step 1: Validar credenciales y verificar si MFA está habilitado
        Step 2: Validar código TOTP
        """
        step = request.data.get('step')

        if step == 1:
            return self._login_step1(request)
        elif step == 2:
            return self._login_step2(request)
        else:
            return Response(
                {"detail": "step debe ser 1 o 2"},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _login_step1(self, request):
        """Validar credenciales y crear sesión temporal"""
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()

        if not username or not password:
            return Response(
                {"detail": "Username y password requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Registrar intento de login
        Auditoria.objects.create(
            usuario=user,
            accion="LOGIN",
            modelo="User",
            objeto_id=user.id,
            ip_address=self._obtener_ip(request),
            descripcion="Intento de login"
        )

        # Verificar si MFA está habilitado
        perfil = getattr(user, 'perfil', None)
        mfa_habilitado = perfil and perfil.mfa_habilitado if perfil else False

        if not mfa_habilitado:
            # Sin MFA, generar tokens directamente
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh.token),
                "mfa_requerido": False,
                "usuario": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "rol": perfil.rol if perfil else None,
                }
            }, status=status.HTTP_200_OK)

        # Con MFA, crear sesión temporal
        session_id = self._crear_sesion_mfa(user)
        return Response({
            "mfa_requerido": True,
            "session_id": session_id,
            "detail": "Ingresa tu código de autenticación"
        }, status=status.HTTP_202_ACCEPTED)

    def _login_step2(self, request):
        """Validar código TOTP y generar tokens"""
        session_id = request.data.get('session_id', '').strip()
        codigo = request.data.get('codigo', '').strip()

        if not session_id or not codigo:
            return Response(
                {"detail": "session_id y codigo requeridos"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Recuperar usuario de sesión temporal
        user_id = self._obtener_usuario_sesion(session_id)
        if not user_id:
            return Response(
                {"detail": "Sesión expirada o inválida"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validar código TOTP
        perfil = getattr(user, 'perfil', None)
        if not perfil or not perfil.mfa_secret:
            return Response(
                {"detail": "MFA no configurado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        totp = pyotp.TOTP(perfil.mfa_secret)
        if not totp.verify(codigo):
            return Response(
                {"detail": "Código de autenticación inválido"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Registrar login exitoso
        Auditoria.objects.create(
            usuario=user,
            accion="LOGIN",
            modelo="User",
            objeto_id=user.id,
            ip_address=self._obtener_ip(request),
            descripcion="Login exitoso con MFA"
        )

        # Limpiar sesión temporal
        self._eliminar_sesion_mfa(session_id)

        # Generar tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh.token),
            "usuario": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "rol": perfil.rol if perfil else None,
            }
        }, status=status.HTTP_200_OK)

    def _crear_sesion_mfa(self, user):
        """Crear sesión temporal para MFA (5 minutos)"""
        import uuid
        session_id = str(uuid.uuid4())

        if r:
            r.setex(f"mfa_session:{session_id}", 300, str(user.id))
        else:
            # Fallback en memoria (solo en dev)
            if not hasattr(self, '_mfa_sessions'):
                self._mfa_sessions = {}
            self._mfa_sessions[session_id] = {'user_id': user.id, 'expires': timezone.now() + timezone.timedelta(minutes=5)}

        return session_id

    def _obtener_usuario_sesion(self, session_id):
        """Obtener ID de usuario de sesión temporal"""
        if r:
            user_id = r.get(f"mfa_session:{session_id}")
            return int(user_id) if user_id else None
        else:
            if hasattr(self, '_mfa_sessions') and session_id in self._mfa_sessions:
                session = self._mfa_sessions[session_id]
                if session['expires'] > timezone.now():
                    return session['user_id']
            return None

    def _eliminar_sesion_mfa(self, session_id):
        """Eliminar sesión temporal"""
        if r:
            r.delete(f"mfa_session:{session_id}")
        else:
            if hasattr(self, '_mfa_sessions') and session_id in self._mfa_sessions:
                del self._mfa_sessions[session_id]

    def _obtener_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
