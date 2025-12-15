"""
Gestión completa de perfil de usuario
- Editar perfil (nombre, email, foto, biografía)
- Gestión de correos adicionales
- Solicitud de cambio de rol (solo 1 vez)
- Configuración MFA
"""
import pyotp
import qrcode
import io
import base64
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from src.models import PerfilUsuario, CorreoAdicional, SolicitudCambioRol, Auditoria
from src.permissions import TieneRol


class PerfilUsuarioView(APIView):
    """
    GET: Obtener perfil completo del usuario autenticado
    PUT: Actualizar perfil (nombre, email, foto, biografía, teléfono)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener perfil completo"""
        user = request.user
        perfil = user.perfil

        # Correos adicionales
        correos = CorreoAdicional.objects.filter(usuario=user)
        correos_data = [
            {
                "id": c.id,
                "email": c.email,
                "verificado": c.verificado,
                "principal": c.principal,
                "fecha_agregado": c.fecha_agregado
            }
            for c in correos
        ]

        # Verificar si ya solicitó cambio de rol
        tiene_solicitud_pendiente = SolicitudCambioRol.objects.filter(
            usuario=user,
            estado='PENDIENTE'
        ).exists()

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "rol": perfil.rol,
            "rol_display": perfil.get_rol_display(),
            "foto_perfil": perfil.foto_perfil.url if perfil.foto_perfil else None,
            "biografia": perfil.biografia,
            "telefono": perfil.telefono,
            "mfa_habilitado": perfil.mfa_habilitado,
            "cambio_rol_solicitado": perfil.cambio_rol_solicitado,
            "tiene_solicitud_pendiente": tiene_solicitud_pendiente,
            "correos_adicionales": correos_data,
            "fecha_registro": user.date_joined
        })

    def put(self, request):
        """Actualizar perfil"""
        user = request.user
        perfil = user.perfil

        # Actualizar datos básicos
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)

        # Email principal (solo si cambia)
        nuevo_email = request.data.get('email')
        if nuevo_email and nuevo_email != user.email:
            # Verificar que no esté en uso
            if User.objects.filter(email=nuevo_email).exclude(id=user.id).exists():
                return Response(
                    {"detail": "Este email ya está en uso"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = nuevo_email

        user.save()

        # Actualizar perfil extendido
        perfil.biografia = request.data.get('biografia', perfil.biografia)
        perfil.telefono = request.data.get('telefono', perfil.telefono)

        # Foto de perfil (si viene)
        foto = request.FILES.get('foto_perfil')
        if foto:
            # Validar tamaño (max 5MB)
            if foto.size > 5 * 1024 * 1024:
                return Response(
                    {"detail": "La foto no puede superar 5MB"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            perfil.foto_perfil = foto

        perfil.save()

        # Auditar
        Auditoria.objects.create(
            usuario=user,
            rol=perfil.rol,
            accion="UPDATE",
            modelo="PerfilUsuario",
            objeto_id=perfil.id,
            descripcion="Perfil actualizado",
            ip_address=self.get_client_ip(request)
        )

        return Response({
            "detail": "Perfil actualizado correctamente",
            "foto_perfil": perfil.foto_perfil.url if perfil.foto_perfil else None
        })

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class CorreoAdicionalView(APIView):
    """
    GET: Listar correos adicionales
    POST: Agregar nuevo correo
    DELETE: Eliminar correo adicional
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Listar correos"""
        correos = CorreoAdicional.objects.filter(usuario=request.user)
        data = [
            {
                "id": c.id,
                "email": c.email,
                "verificado": c.verificado,
                "principal": c.principal,
                "fecha_agregado": c.fecha_agregado
            }
            for c in correos
        ]
        return Response({"correos": data})

    def post(self, request):
        """Agregar correo adicional"""
        email = request.data.get('email')

        if not email:
            return Response(
                {"detail": "El email es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que no exista
        if CorreoAdicional.objects.filter(usuario=request.user, email=email).exists():
            return Response(
                {"detail": "Este correo ya está agregado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que no esté en uso como email principal de otro usuario
        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Este correo ya está registrado en el sistema"},
                status=status.HTTP_400_BAD_REQUEST
            )

        correo = CorreoAdicional.objects.create(
            usuario=request.user,
            email=email,
            verificado=False,
            principal=False
        )

        # Auditar
        Auditoria.objects.create(
            usuario=request.user,
            rol=request.user.perfil.rol,
            accion="CREATE",
            modelo="CorreoAdicional",
            objeto_id=correo.id,
            descripcion=f"Correo adicional agregado: {email}"
        )

        return Response({
            "id": correo.id,
            "email": correo.email,
            "verificado": correo.verificado,
            "detail": "Correo agregado correctamente"
        }, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Eliminar correo adicional"""
        correo_id = request.data.get('correo_id')

        try:
            correo = CorreoAdicional.objects.get(id=correo_id, usuario=request.user)
        except CorreoAdicional.DoesNotExist:
            return Response(
                {"detail": "Correo no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # No permitir eliminar el principal
        if correo.principal:
            return Response(
                {"detail": "No puedes eliminar el correo principal"},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = correo.email
        correo.delete()

        # Auditar
        Auditoria.objects.create(
            usuario=request.user,
            rol=request.user.perfil.rol,
            accion="DELETE",
            modelo="CorreoAdicional",
            objeto_id=correo_id,
            descripcion=f"Correo eliminado: {email}"
        )

        return Response({"detail": "Correo eliminado correctamente"})


class SolicitudCambioRolView(APIView):
    """
    GET: Ver solicitud de cambio de rol (si existe)
    POST: Crear solicitud de cambio de rol (solo 1 vez)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Ver solicitud actual"""
        solicitudes = SolicitudCambioRol.objects.filter(usuario=request.user).order_by('-fecha_solicitud')

        if not solicitudes.exists():
            return Response({
                "tiene_solicitud": False,
                "puede_solicitar": not request.user.perfil.cambio_rol_solicitado
            })

        ultima = solicitudes.first()
        return Response({
            "tiene_solicitud": True,
            "puede_solicitar": not request.user.perfil.cambio_rol_solicitado,
            "solicitud": {
                "id": ultima.id,
                "rol_actual": ultima.rol_actual,
                "rol_solicitado": ultima.rol_solicitado,
                "justificacion": ultima.justificacion,
                "estado": ultima.estado,
                "fecha_solicitud": ultima.fecha_solicitud,
                "fecha_respuesta": ultima.fecha_respuesta,
                "comentario_admin": ultima.comentario_admin
            },
            "historial": [
                {
                    "id": s.id,
                    "rol_solicitado": s.rol_solicitado,
                    "estado": s.estado,
                    "fecha_solicitud": s.fecha_solicitud
                }
                for s in solicitudes
            ]
        })

    def post(self, request):
        """Crear solicitud de cambio de rol"""
        perfil = request.user.perfil

        # Verificar si ya solicitó alguna vez
        if perfil.cambio_rol_solicitado:
            return Response(
                {"detail": "Ya has utilizado tu única solicitud de cambio de rol"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verificar si tiene solicitud pendiente
        if SolicitudCambioRol.objects.filter(usuario=request.user, estado='PENDIENTE').exists():
            return Response(
                {"detail": "Ya tienes una solicitud pendiente"},
                status=status.HTTP_400_BAD_REQUEST
            )

        rol_solicitado = request.data.get('rol_solicitado')
        justificacion = request.data.get('justificacion', '')

        if not rol_solicitado:
            return Response(
                {"detail": "El rol solicitado es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if rol_solicitado not in dict(PerfilUsuario.ROL_CHOICES):
            return Response(
                {"detail": "Rol inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if rol_solicitado == perfil.rol:
            return Response(
                {"detail": "No puedes solicitar tu rol actual"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not justificacion or len(justificacion) < 50:
            return Response(
                {"detail": "La justificación debe tener al menos 50 caracteres"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear solicitud
        solicitud = SolicitudCambioRol.objects.create(
            usuario=request.user,
            rol_actual=perfil.rol,
            rol_solicitado=rol_solicitado,
            justificacion=justificacion,
            estado='PENDIENTE'
        )

        # Marcar que ya solicitó
        perfil.cambio_rol_solicitado = True
        perfil.save()

        # Auditar
        Auditoria.objects.create(
            usuario=request.user,
            rol=perfil.rol,
            accion="CREATE",
            modelo="SolicitudCambioRol",
            objeto_id=solicitud.id,
            descripcion=f"Solicitud cambio de rol: {perfil.rol} → {rol_solicitado}",
            metadatos={
                "rol_actual": perfil.rol,
                "rol_solicitado": rol_solicitado
            }
        )

        return Response({
            "detail": "Solicitud enviada correctamente. Será revisada por un administrador",
            "id": solicitud.id,
            "estado": solicitud.estado
        }, status=status.HTTP_201_CREATED)


class MFAConfigView(APIView):
    """
    GET: Obtener estado de MFA
    POST: Habilitar MFA (generar QR)
    DELETE: Deshabilitar MFA
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Ver estado MFA"""
        perfil = request.user.perfil

        return Response({
            "mfa_habilitado": perfil.mfa_habilitado,
            "tiene_secret": bool(perfil.mfa_secret)
        })

    def post(self, request):
        """Habilitar MFA - generar secret y QR"""
        perfil = request.user.perfil

        if perfil.mfa_habilitado:
            return Response(
                {"detail": "MFA ya está habilitado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generar secret
        secret = pyotp.random_base32()
        perfil.mfa_secret = secret
        perfil.save()

        # Generar URI para QR
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=request.user.email,
            issuer_name='Proyecto Sistema'
        )

        # Generar código QR
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(totp_uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()

        return Response({
            "detail": "MFA configurado. Escanea el código QR con tu app de autenticación",
            "secret": secret,
            "qr_code": f"data:image/png;base64,{qr_code_base64}",
            "uri": totp_uri
        })

    def put(self, request):
        """Activar MFA - verificar código"""
        perfil = request.user.perfil
        codigo = request.data.get('codigo')

        if not perfil.mfa_secret:
            return Response(
                {"detail": "Primero debes generar el código QR"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not codigo:
            return Response(
                {"detail": "El código es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar código
        totp = pyotp.TOTP(perfil.mfa_secret)
        if not totp.verify(codigo, valid_window=1):
            return Response(
                {"detail": "Código inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Activar MFA
        perfil.mfa_habilitado = True
        perfil.save()

        # Auditar
        Auditoria.objects.create(
            usuario=request.user,
            rol=perfil.rol,
            accion="UPDATE",
            modelo="PerfilUsuario",
            objeto_id=perfil.id,
            descripcion="MFA habilitado"
        )

        return Response({
            "detail": "MFA habilitado correctamente",
            "mfa_habilitado": True
        })

    def delete(self, request):
        """Deshabilitar MFA"""
        perfil = request.user.perfil
        codigo = request.data.get('codigo')

        if not perfil.mfa_habilitado:
            return Response(
                {"detail": "MFA no está habilitado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not codigo:
            return Response(
                {"detail": "El código es obligatorio para deshabilitar MFA"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar código antes de deshabilitar
        totp = pyotp.TOTP(perfil.mfa_secret)
        if not totp.verify(codigo, valid_window=1):
            return Response(
                {"detail": "Código inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Deshabilitar
        perfil.mfa_habilitado = False
        perfil.mfa_secret = ''
        perfil.save()

        # Auditar
        Auditoria.objects.create(
            usuario=request.user,
            rol=perfil.rol,
            accion="UPDATE",
            modelo="PerfilUsuario",
            objeto_id=perfil.id,
            descripcion="MFA deshabilitado"
        )

        return Response({"detail": "MFA deshabilitado correctamente"})


class GestionSolicitudesRolView(APIView):
    """
    Gestión de solicitudes de cambio de rol (solo TI/ADMIN)
    GET: Listar todas las solicitudes
    PATCH: Aprobar/rechazar solicitud
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["TI", "ADMIN"]

    def get(self, request):
        """Listar solicitudes"""
        estado = request.query_params.get('estado', 'PENDIENTE')

        solicitudes = SolicitudCambioRol.objects.select_related(
            'usuario', 'usuario__perfil', 'respondido_por'
        ).filter(estado=estado).order_by('-fecha_solicitud')

        data = [
            {
                "id": s.id,
                "usuario": s.usuario.username,
                "usuario_nombre": f"{s.usuario.first_name} {s.usuario.last_name}",
                "rol_actual": s.rol_actual,
                "rol_solicitado": s.rol_solicitado,
                "justificacion": s.justificacion,
                "estado": s.estado,
                "fecha_solicitud": s.fecha_solicitud,
                "fecha_respuesta": s.fecha_respuesta,
                "respondido_por": s.respondido_por.username if s.respondido_por else None,
                "comentario_admin": s.comentario_admin
            }
            for s in solicitudes
        ]

        return Response({
            "total": len(data),
            "solicitudes": data
        })

    def patch(self, request, solicitud_id):
        """Aprobar o rechazar solicitud"""
        try:
            solicitud = SolicitudCambioRol.objects.select_related('usuario', 'usuario__perfil').get(id=solicitud_id)
        except SolicitudCambioRol.DoesNotExist:
            return Response(
                {"detail": "Solicitud no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        if solicitud.estado != 'PENDIENTE':
            return Response(
                {"detail": "Esta solicitud ya fue procesada"},
                status=status.HTTP_400_BAD_REQUEST
            )

        accion = request.data.get('accion')  # APROBAR | RECHAZAR
        comentario = request.data.get('comentario', '')

        if accion not in ['APROBAR', 'RECHAZAR']:
            return Response(
                {"detail": "Acción inválida. Use APROBAR o RECHAZAR"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if accion == 'APROBAR':
            # Cambiar rol del usuario
            perfil = solicitud.usuario.perfil
            rol_anterior = perfil.rol
            perfil.rol = solicitud.rol_solicitado
            perfil.save()

            solicitud.estado = 'APROBADA'
            solicitud.fecha_respuesta = timezone.now()
            solicitud.respondido_por = request.user
            solicitud.comentario_admin = comentario
            solicitud.save()

            # Auditar
            Auditoria.objects.create(
                usuario=request.user,
                rol=request.user.perfil.rol,
                accion="RESOLUCION",
                modelo="SolicitudCambioRol",
                objeto_id=solicitud.id,
                descripcion=f"Cambio de rol aprobado: {solicitud.usuario.username} → {solicitud.rol_solicitado}",
                metadatos={
                    "usuario_afectado": solicitud.usuario.username,
                    "rol_anterior": rol_anterior,
                    "rol_nuevo": solicitud.rol_solicitado
                }
            )

            return Response({
                "detail": f"Solicitud aprobada. {solicitud.usuario.username} ahora es {solicitud.rol_solicitado}",
                "estado": "APROBADA"
            })

        else:  # RECHAZAR
            solicitud.estado = 'RECHAZADA'
            solicitud.fecha_respuesta = timezone.now()
            solicitud.respondido_por = request.user
            solicitud.comentario_admin = comentario
            solicitud.save()

            # Auditar
            Auditoria.objects.create(
                usuario=request.user,
                rol=request.user.perfil.rol,
                accion="RESOLUCION",
                modelo="SolicitudCambioRol",
                objeto_id=solicitud.id,
                descripcion=f"Cambio de rol rechazado: {solicitud.usuario.username}",
                metadatos={
                    "usuario_afectado": solicitud.usuario.username,
                    "rol_solicitado": solicitud.rol_solicitado,
                    "motivo": comentario
                }
            )

            return Response({
                "detail": "Solicitud rechazada",
                "estado": "RECHAZADA"
            })
