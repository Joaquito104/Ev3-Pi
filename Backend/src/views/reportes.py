"""
Vista para Dashboard de Auditorías con reportes y estadísticas
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q
from datetime import datetime, timedelta
from src.models import Auditoria, Calificacion
from src.permissions import TieneRol


class ReporteAuditoriaView(APIView):
    """
    Reporte general de auditorías
    GET: Obtener datos para dashboard
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI"]

    def get(self, request):
        """
        Retorna estadísticas de auditorías
        Parámetros query opcionales:
        - dias: últimos N días (default: 30)
        - estado: filtrar por estado
        """
        dias = int(request.query_params.get('dias', 30))
        fecha_inicio = datetime.now() - timedelta(days=dias)

        # Filtrar auditorías del período
        auditorias = Auditoria.objects.filter(fecha__gte=fecha_inicio)

        # 1. Total de auditorías
        total_auditorias = auditorias.count()

        # 2. Auditorías por acción
        por_accion = dict(
            auditorias.values('accion').annotate(count=Count('accion')).values_list('accion', 'count')
        )

        # 3. Auditorías por usuario
        por_usuario = list(
            auditorias.values('usuario__username').annotate(count=Count('usuario')).values_list(
                'usuario__username', 'count'
            )
        )

        # 4. Auditorías por modelo
        por_modelo = dict(
            auditorias.values('modelo').annotate(count=Count('modelo')).values_list('modelo', 'count')
        )

        # 5. Solicitudes de auditoría pendientes (acción = RESOLUCION)
        solicitudes_auditoria = Auditoria.objects.filter(
            accion="RESOLUCION",
            metadatos__tipo="SOLICITUD_AUDITORIA"
        ).count()

        # 6. Tendencia últimos 7 días
        tendencia_7dias = []
        for i in range(7, 0, -1):
            fecha = datetime.now() - timedelta(days=i)
            fecha_dia_siguiente = fecha + timedelta(days=1)
            count = auditorias.filter(fecha__date=fecha.date()).count()
            tendencia_7dias.append({
                'fecha': fecha.strftime('%d/%m'),
                'total': count
            })

        # 7. Actividad reciente
        recientes = list(
            auditorias.values(
                'id', 'usuario__first_name', 'accion', 'modelo', 'descripcion', 'fecha'
            ).order_by('-fecha')[:10]
        )

        return Response({
            'resumen': {
                'total_auditorias': total_auditorias,
                'solicitudes_auditoria_pendientes': solicitudes_auditoria,
                'periodo_dias': dias,
                'fecha_inicio': fecha_inicio.isoformat()
            },
            'por_accion': por_accion,
            'por_usuario': por_usuario,
            'por_modelo': por_modelo,
            'tendencia_7dias': tendencia_7dias,
            'actividad_reciente': recientes
        })


class ReporteCalificacionesView(APIView):
    """
    Reporte de calificaciones con estadísticas
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "ANALISTA", "TI"]

    def get(self, request):
        """
        Retorna estadísticas de calificaciones
        Parámetros query opcionales:
        - dias: últimos N días (default: 30)
        - estado: filtrar por estado (BORRADOR, PENDIENTE, VALIDADA, etc)
        - rol_creador: filtrar por rol del creador
        """
        dias = int(request.query_params.get('dias', 30))
        estado_filtro = request.query_params.get('estado')
        fecha_inicio = datetime.now() - timedelta(days=dias)

        # Filtrar calificaciones del período
        calificaciones = Calificacion.objects.filter(fecha_creacion__gte=fecha_inicio)

        if estado_filtro:
            calificaciones = calificaciones.filter(estado=estado_filtro)

        # 1. Total de calificaciones
        total = calificaciones.count()

        # 2. Por estado
        por_estado = dict(
            calificaciones.values('estado').annotate(count=Count('estado')).values_list('estado', 'count')
        )

        # 3. Distribución de estados en porcentaje
        distribucion_estados = {}
        for estado, count in por_estado.items():
            distribucion_estados[estado] = round((count / total * 100) if total > 0 else 0, 2)

        # 4. Calificaciones con auditoría solicitada
        con_auditoria = calificaciones.filter(solicitar_auditoria=True).count()

        # 5. Tasa de validación (validadas / pendientes)
        validadas = calificaciones.filter(estado="VALIDADA").count()
        observadas = calificaciones.filter(estado="OBSERVADA").count()
        rechazadas = calificaciones.filter(estado="RECHAZADA").count()

        tasa_validacion = round((validadas / total * 100) if total > 0 else 0, 2)
        tasa_observacion = round((observadas / total * 100) if total > 0 else 0, 2)
        tasa_rechazo = round((rechazadas / total * 100) if total > 0 else 0, 2)

        # 6. Promedio de tiempo de validación (si se puede calcular)
        validadas_con_fecha = calificaciones.filter(
            estado="VALIDADA",
            fecha_actualizacion__isnull=False
        )
        tiempo_promedio = None
        if validadas_con_fecha.exists():
            tiempos = []
            for cal in validadas_con_fecha:
                diferencia = (cal.fecha_actualizacion - cal.fecha_creacion).total_seconds() / 3600
                tiempos.append(diferencia)
            tiempo_promedio = round(sum(tiempos) / len(tiempos), 2) if tiempos else None

        # 7. Top 5 creadores (corredores)
        top_creadores = list(
            calificaciones.values('creado_por__first_name').annotate(
                count=Count('creado_por')
            ).order_by('-count')[:5]
        )

        return Response({
            'resumen': {
                'total_calificaciones': total,
                'con_auditoria_solicitada': con_auditoria,
                'periodo_dias': dias,
                'fecha_inicio': fecha_inicio.isoformat()
            },
            'por_estado': por_estado,
            'distribucion_porcentaje': distribucion_estados,
            'metricas': {
                'tasa_validacion': tasa_validacion,
                'tasa_observacion': tasa_observacion,
                'tasa_rechazo': tasa_rechazo,
                'tiempo_validacion_promedio_horas': tiempo_promedio
            },
            'top_creadores': top_creadores
        })


class ComparativaAuditoriaView(APIView):
    """
    Comparativa de auditorías entre períodos
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI"]

    def get(self, request):
        """
        Comparar auditorías de dos períodos
        Parámetros query:
        - periodo1_dias: días hace que comienza período 1 (default: 60)
        - periodo1_duracion: duración período 1 en días (default: 30)
        - periodo2_dias: días hace que comienza período 2 (default: 30)
        - periodo2_duracion: duración período 2 en días (default: 30)
        """
        p1_dias = int(request.query_params.get('periodo1_dias', 60))
        p1_duracion = int(request.query_params.get('periodo1_duracion', 30))
        p2_dias = int(request.query_params.get('periodo2_dias', 30))
        p2_duracion = int(request.query_params.get('periodo2_duracion', 30))

        # Período 1
        fecha_p1_inicio = datetime.now() - timedelta(days=p1_dias)
        fecha_p1_fin = fecha_p1_inicio + timedelta(days=p1_duracion)

        # Período 2
        fecha_p2_inicio = datetime.now() - timedelta(days=p2_dias)
        fecha_p2_fin = fecha_p2_inicio + timedelta(days=p2_duracion)

        auditorias_p1 = Auditoria.objects.filter(
            fecha__gte=fecha_p1_inicio,
            fecha__lte=fecha_p1_fin
        )

        auditorias_p2 = Auditoria.objects.filter(
            fecha__gte=fecha_p2_inicio,
            fecha__lte=fecha_p2_fin
        )

        total_p1 = auditorias_p1.count()
        total_p2 = auditorias_p2.count()

        # Calcular variación
        variacion = total_p2 - total_p1
        variacion_porcentaje = round((variacion / total_p1 * 100) if total_p1 > 0 else 0, 2)

        return Response({
            'periodo_1': {
                'inicio': fecha_p1_inicio.isoformat(),
                'fin': fecha_p1_fin.isoformat(),
                'total_auditorias': total_p1,
                'por_accion': dict(
                    auditorias_p1.values('accion').annotate(count=Count('accion')).values_list('accion', 'count')
                )
            },
            'periodo_2': {
                'inicio': fecha_p2_inicio.isoformat(),
                'fin': fecha_p2_fin.isoformat(),
                'total_auditorias': total_p2,
                'por_accion': dict(
                    auditorias_p2.values('accion').annotate(count=Count('accion')).values_list('accion', 'count')
                )
            },
            'comparativa': {
                'variacion_absoluta': variacion,
                'variacion_porcentaje': variacion_porcentaje,
                'tendencia': 'Aumento' if variacion > 0 else 'Disminución' if variacion < 0 else 'Sin cambios'
            }
        })
