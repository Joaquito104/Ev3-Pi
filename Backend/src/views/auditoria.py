"""
Vista de Auditoría completa con filtros
Solo lectura: AUDITOR, TI, ADMIN
Filtros: fecha_desde, fecha_hasta, usuario, accion, modelo, objeto_id
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from src.permissions import TieneRol
from src.models import Auditoria


class AuditoriaView(APIView):
    """
    GET: Listar auditorías con filtros
    Solo lectura - no permite POST/PUT/DELETE
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI", "ADMIN"]

    def get(self, request):
        """
        Listar auditorías con filtros opcionales
        Query params:
            - fecha_desde: YYYY-MM-DD (default: últimos 30 días)
            - fecha_hasta: YYYY-MM-DD (default: hoy)
            - usuario: username (exacto)
            - accion: CREATE|UPDATE|DELETE|LOGIN|LOGOUT|ESTADO_CAMBIO|RESOLUCION
            - modelo: Registro|Calificacion|Certificado|ReglaNegocio
            - objeto_id: int
            - rol: CORREDOR|ANALISTA|AUDITOR|TI|ADMIN
            - page: int (default: 1)
            - page_size: int (default: 50, max: 200)
        """
        # Filtrar desde últimos 30 días por defecto
        fecha_hasta = datetime.now().date()
        fecha_desde = fecha_hasta - timedelta(days=30)

        # Parse fechas si vienen en params
        fecha_desde_param = request.query_params.get('fecha_desde')
        if fecha_desde_param:
            try:
                fecha_desde = datetime.strptime(fecha_desde_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"detail": "fecha_desde inválida. Use formato YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        fecha_hasta_param = request.query_params.get('fecha_hasta')
        if fecha_hasta_param:
            try:
                fecha_hasta = datetime.strptime(fecha_hasta_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"detail": "fecha_hasta inválida. Use formato YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Query base
        auditorias = Auditoria.objects.filter(
            fecha__date__gte=fecha_desde,
            fecha__date__lte=fecha_hasta
        ).select_related('usuario')

        # Filtros adicionales
        usuario_param = request.query_params.get('usuario')
        if usuario_param:
            try:
                user = User.objects.get(username=usuario_param)
                auditorias = auditorias.filter(usuario=user)
            except User.DoesNotExist:
                return Response(
                    {"detail": f"Usuario '{usuario_param}' no encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )

        accion_param = request.query_params.get('accion')
        if accion_param:
            if accion_param not in dict(Auditoria.ACCION_CHOICES):
                return Response(
                    {"detail": "Acción inválida"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            auditorias = auditorias.filter(accion=accion_param)

        modelo_param = request.query_params.get('modelo')
        if modelo_param:
            auditorias = auditorias.filter(modelo=modelo_param)

        objeto_id_param = request.query_params.get('objeto_id')
        if objeto_id_param:
            try:
                auditorias = auditorias.filter(objeto_id=int(objeto_id_param))
            except ValueError:
                return Response(
                    {"detail": "objeto_id debe ser un número"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        rol_param = request.query_params.get('rol')
        if rol_param:
            auditorias = auditorias.filter(rol=rol_param)

        # Ordenar por fecha descendente
        auditorias = auditorias.order_by('-fecha')

        # Paginación
        page = int(request.query_params.get('page', 1))
        page_size = min(int(request.query_params.get('page_size', 50)), 200)

        start = (page - 1) * page_size
        end = start + page_size

        total = auditorias.count()
        auditorias_paginated = auditorias[start:end]

        # Serializar
        data = []
        for audit in auditorias_paginated:
            data.append({
                "id": audit.id,
                "fecha": audit.fecha,
                "usuario": audit.usuario.username if audit.usuario else None,
                "rol": audit.rol,
                "accion": audit.accion,
                "accion_display": audit.get_accion_display(),
                "modelo": audit.modelo,
                "objeto_id": audit.objeto_id,
                "descripcion": audit.descripcion,
                "ip_address": audit.ip_address,
                "metadatos": audit.metadatos
            })

        return Response({
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
            "fecha_desde": fecha_desde.isoformat(),
            "fecha_hasta": fecha_hasta.isoformat(),
            "resultados": data
        })


class AuditoriaEstadisticasView(APIView):
    """
    GET: Estadísticas de auditoría
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI", "ADMIN"]

    def get(self, request):
        """
        Estadísticas generales de auditoría
        """
        from django.db.models import Count
        from datetime import datetime, timedelta

        # Últimos 30 días
        fecha_desde = datetime.now() - timedelta(days=30)

        auditorias = Auditoria.objects.filter(fecha__gte=fecha_desde)

        # Totales por acción
        por_accion = auditorias.values('accion').annotate(total=Count('id')).order_by('-total')

        # Totales por modelo
        por_modelo = auditorias.values('modelo').annotate(total=Count('id')).order_by('-total')

        # Usuarios más activos
        usuarios_activos = auditorias.values('usuario__username').annotate(
            total=Count('id')
        ).order_by('-total')[:10]

        # Totales por rol
        por_rol = auditorias.values('rol').annotate(total=Count('id')).order_by('-total')

        return Response({
            "periodo": "Últimos 30 días",
            "total_eventos": auditorias.count(),
            "por_accion": list(por_accion),
            "por_modelo": list(por_modelo),
            "usuarios_activos": list(usuarios_activos),
            "por_rol": list(por_rol)
        })

