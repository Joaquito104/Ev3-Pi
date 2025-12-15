from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from src.models import Feedback, CasoSoporte, Auditoria
from src.serializers import FeedbackSerializer
from src.utils_registro import enviar_email_caso_soporte
import uuid


class FeedbackView(APIView):
    """Retroalimentación general del sistema"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Crear feedback"""
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            feedback = serializer.save(usuario=request.user)

            # Auditoría
            Auditoria.objects.create(
                usuario=request.user,
                accion="CREATE",
                modelo="Feedback",
                objeto_id=feedback.id,
                ip_address=self._obtener_ip(request),
                descripcion="Nuevo feedback enviado"
            )

            return Response({
                "id": feedback.id,
                "message": "✅ Gracias por tu feedback, nos ayuda a mejorar"
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _obtener_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class CasoSoporteView(APIView):
    """Gestión de casos de soporte/ayuda"""
    permission_classes = [AllowAny]

    def post(self, request):
        """Crear nuevo caso de soporte"""

        # Validar datos requeridos
        required_fields = ['nombre', 'email', 'titulo', 'descripcion', 'tipo']
        for field in required_fields:
            if field not in request.data:
                return Response(
                    {"detail": f"Campo requerido: {field}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            # Crear caso
            caso = CasoSoporte.objects.create(
                usuario=request.user if request.user.is_authenticated else None,
                nombre=request.data.get('nombre').strip(),
                email=request.data.get('email').strip().lower(),
                titulo=request.data.get('titulo').strip(),
                descripcion=request.data.get('descripcion').strip(),
                tipo=request.data.get('tipo'),
                prioridad=request.data.get('prioridad', 'MEDIA'),
            )

            # Enviar email de confirmación
            email_enviado = enviar_email_caso_soporte(caso)
            if email_enviado:
                caso.email_contacto_enviado = True
                caso.save()

            # Auditoría
            if request.user.is_authenticated:
                Auditoria.objects.create(
                    usuario=request.user,
                    accion="CREATE",
                    modelo="CasoSoporte",
                    objeto_id=caso.id,
                    ip_address=self._obtener_ip(request),
                    descripcion=f"Nuevo caso de soporte: {caso.id_caso}"
                )

            return Response({
                "id_caso": caso.id_caso,
                "mensaje": "✅ Caso creado exitosamente",
                "detalles": f"Hemos enviado un email a {caso.email} para contactarte",
                "email_enviado": email_enviado
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"detail": f"Error al crear caso: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        """Obtener casos del usuario autenticado"""
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Debes iniciar sesión para ver tus casos"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        casos = CasoSoporte.objects.filter(usuario=request.user)
        data = [{
            'id_caso': caso.id_caso,
            'titulo': caso.titulo,
            'tipo': caso.tipo,
            'estado': caso.estado,
            'prioridad': caso.prioridad,
            'fecha_creacion': caso.fecha_creacion,
            'fecha_actualizacion': caso.fecha_actualizacion,
            'respuesta_admin': caso.respuesta_admin,
        } for caso in casos]

        return Response(data, status=status.HTTP_200_OK)

    def _obtener_ip(self, request):
        """Obtener IP del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class CasoSoporteDetailView(APIView):
    """Detalle de un caso de soporte"""
    permission_classes = [AllowAny]

    def get(self, request, id_caso):
        """Obtener detalle de caso por ID"""
        try:
            caso = CasoSoporte.objects.get(id_caso=id_caso)

            # Verificar permisos (solo propietario o admin)
            if request.user.is_authenticated and (caso.usuario == request.user or request.user.is_superuser):
                puede_ver = True
            elif not request.user.is_authenticated and caso.email == request.query_params.get('email'):
                puede_ver = True
            else:
                puede_ver = False

            if not puede_ver:
                return Response(
                    {"detail": "No tienes permiso para ver este caso"},
                    status=status.HTTP_403_FORBIDDEN
                )

            data = {
                'id_caso': caso.id_caso,
                'titulo': caso.titulo,
                'descripcion': caso.descripcion,
                'tipo': caso.tipo,
                'estado': caso.estado,
                'prioridad': caso.prioridad,
                'fecha_creacion': caso.fecha_creacion,
                'fecha_actualizacion': caso.fecha_actualizacion,
                'respuesta_admin': caso.respuesta_admin,
                'email_contacto_enviado': caso.email_contacto_enviado,
            }

            return Response(data, status=status.HTTP_200_OK)

        except CasoSoporte.DoesNotExist:
            return Response(
                {"detail": "Caso no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
