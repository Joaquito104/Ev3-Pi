import csv
import hashlib
import os

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from bson.objectid import ObjectId
from bson.errors import InvalidId

from src.permissions import TieneRol
from src.mongodb_utils import CalificacionMongo, DocumentoMongo
from src.models import Auditoria, Registro


class CalificacionCorredorView(APIView):
    """
    Vista para Corredor de Inversión
    - Solo puede ver SUS propias calificaciones
    - Puede crear nuevas calificaciones
    - No puede editar ni eliminar
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["CORREDOR"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()

    def get(self, request):
        """
        Listar calificaciones del corredor actual
        Query params: estado, periodo, tipo_certificado
        """
        usuario_id = request.user.id
        
        # Filtros opcionales
        filtros = {}
        if request.query_params.get('estado'):
            filtros['estado'] = request.query_params.get('estado')
        if request.query_params.get('periodo'):
            filtros['periodo'] = request.query_params.get('periodo')
        if request.query_params.get('tipo_certificado'):
            filtros['tipo_certificado'] = request.query_params.get('tipo_certificado')
        
        calificaciones = self.calificacion_mongo.obtener_por_usuario(usuario_id, filtros)
        
        # Serializar (convertir ObjectId a string)
        data = []
        for cal in calificaciones:
            cal['_id'] = str(cal['_id'])
            cal['fecha_creacion'] = cal['fecha_creacion'].isoformat()
            cal['fecha_actualizacion'] = cal['fecha_actualizacion'].isoformat()
            data.append(cal)
        
        return Response({
            "total": len(data),
            "calificaciones": data
        })

    def post(self, request):
        """
        Crear nueva calificación desde certificado cargado
        """
        # Datos del certificado/documento
        data = {
            'usuario_id': request.user.id,
            'creado_por_id': request.user.id,
            'registro_id': request.data.get('registro_id'),  # Relación con PostgreSQL si existe
            'tipo_certificado': request.data.get('tipo_certificado'),
            'rut': request.data.get('rut'),
            'periodo': request.data.get('periodo'),
            'monto': request.data.get('monto', 0),
            'detalles': request.data.get('detalles', {}),
            'metadata': request.data.get('metadata', {}),
            'comentario': request.data.get('comentario', ''),
            'solicitar_auditoria': request.data.get('solicitar_auditoria', False),
            'estado': 'BORRADOR'  # Corredor crea como borrador
        }

        # Validar datos requeridos
        if not data['registro_id']:
            return Response(
                {"detail": "registro_id es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Registro.objects.filter(id=data['registro_id']).exists():
            return Response(
                {"detail": "El registro base no existe"},
                status=status.HTTP_404_NOT_FOUND
            )

        if not data['tipo_certificado'] or not data['rut'] or not data['periodo']:
            return Response(
                {"detail": "tipo_certificado, rut y periodo son obligatorios"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            calificacion_id = self.calificacion_mongo.crear(data)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Auditoría
        Auditoria.objects.create(
            usuario=request.user,
            rol="CORREDOR",
            accion="CREATE",
            modelo="CalificacionMongo",
            objeto_id=None,
            descripcion=f"Corredor creó calificación {calificacion_id} para RUT {data['rut']}"
        )

        # Si solicita auditoría, crear registro adicional
        if data.get('solicitar_auditoria'):
            Auditoria.objects.create(
                usuario=request.user,
                rol="CORREDOR",
                accion="RESOLUCION",
                modelo="CalificacionMongo",
                objeto_id=None,
                descripcion=f"Solicitud de auditoría para calificación {calificacion_id} - RUT: {data['rut']}",
                metadatos={
                    "calificacion_id": str(calificacion_id),
                    "registro_id": data.get('registro_id'),
                    "tipo": "SOLICITUD_AUDITORIA"
                }
            )
        
        # 📧 Enviar emails de notificación
        from src.utils_registro import enviar_email_calificacion_creada, enviar_email_auditoria_solicitada
        
        enviar_email_calificacion_creada(
            usuario=request.user,
            rut=data['rut'],
            tipo_certificado=data['tipo_certificado'],
            solicitar_auditoria=data.get('solicitar_auditoria', False)
        )
        
        if data.get('solicitar_auditoria'):
            enviar_email_auditoria_solicitada(
                usuario=request.user,
                rut=data['rut'],
                calificacion_id=str(calificacion_id)
            )

        return Response({
            "detail": "Calificación creada exitosamente",
            "id": calificacion_id,
            "estado": "BORRADOR",
            "auditoria_solicitada": data.get('solicitar_auditoria', False)
        }, status=status.HTTP_201_CREATED)


class CalificacionCorredorDetailView(APIView):
    """
    Detalle de una calificación específica
    Solo el propietario puede ver
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["CORREDOR"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()

    def get(self, request, calificacion_id):
        """Ver detalle completo de una calificación"""
        try:
            calificacion = self.calificacion_mongo.obtener_por_id(calificacion_id)
        except InvalidId:
            return Response(
                {"detail": "ID de calificación inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not calificacion:
            return Response(
                {"detail": "Calificación no encontrada"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verificar que sea el propietario
        if calificacion['usuario_id'] != request.user.id:
            return Response(
                {"detail": "No tienes permiso para ver esta calificación"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Serializar
        calificacion['_id'] = str(calificacion['_id'])
        calificacion['fecha_creacion'] = calificacion['fecha_creacion'].isoformat()
        calificacion['fecha_actualizacion'] = calificacion['fecha_actualizacion'].isoformat()

        return Response(calificacion)


class CalificacionEstadisticasView(APIView):
    """
    Estadísticas de calificaciones para dashboard del Corredor
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["CORREDOR", "TI"]  # Agregado TI para testing

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()

    def get(self, request):
        """Obtener métricas y estadísticas"""
        try:
            usuario_id = request.user.id
            
            stats = self.calificacion_mongo.obtener_estadisticas(usuario_id)
            
            return Response({
                "usuario": request.user.username,
                "estadisticas": stats
            })
        except Exception as e:
            import traceback
            print(f"Error en CalificacionEstadisticasView: {e}")
            print(traceback.format_exc())
            return Response({
                "usuario": request.user.username,
                "estadisticas": {
                    "por_estado": {},
                    "total": 0,
                    "monto_total": 0,
                    "error": str(e)
                }
            })


class CalificacionAnalistaView(APIView):
    """
    Vista para Analista Tributario
    - Puede ver TODAS las calificaciones
    - Puede editar estado y comentarios
    - Puede enviar a validación
    """
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["ANALISTA", "AUDITOR", "TI"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()

    def get(self, request):
        """Listar todas las calificaciones (sin filtro de usuario)"""
        # Para analistas: ver todas
        filtros = {}
        if request.query_params.get('estado'):
            filtros['estado'] = request.query_params.get('estado')
        
        # Obtener todas (sin filtro de usuario_id)
        calificaciones = list(self.calificacion_mongo.collection.find(filtros).sort('fecha_creacion', -1).limit(100))
        
        # Serializar
        data = []
        for cal in calificaciones:
            cal['_id'] = str(cal['_id'])
            cal['fecha_creacion'] = cal['fecha_creacion'].isoformat()
            cal['fecha_actualizacion'] = cal['fecha_actualizacion'].isoformat()
            data.append(cal)
        
        return Response({
            "total": len(data),
            "calificaciones": data
        })

    def put(self, request, calificacion_id):
        """Actualizar estado de calificación"""
        try:
            data_actualizar = {}

            actual = self.calificacion_mongo.obtener_por_id(calificacion_id)
            if not actual:
                return Response({"detail": "Calificación no encontrada"}, status=status.HTTP_404_NOT_FOUND)

            if actual.get('estado') in ['PENDIENTE', 'APROBADA', 'RECHAZADA']:
                return Response({"detail": "No editable en este estado"}, status=status.HTTP_400_BAD_REQUEST)
            
            if 'estado' in request.data:
                data_actualizar['estado'] = request.data['estado']
            if 'comentario' in request.data:
                data_actualizar['comentario'] = request.data['comentario']
            if 'detalles' in request.data:
                data_actualizar['detalles'] = request.data['detalles']
            
            success = self.calificacion_mongo.actualizar(
                calificacion_id,
                data_actualizar,
                request.user.username
            )
            
            if not success:
                return Response(
                    {"detail": "Error al actualizar calificación"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Auditoría
            Auditoria.objects.create(
                usuario=request.user,
                rol=getattr(request.user.perfil, 'rol', 'ANALISTA'),
                accion="UPDATE",
                modelo="CalificacionMongo",
                descripcion=f"Actualizó calificación {calificacion_id}"
            )
            
            return Response({"detail": "Calificación actualizada exitosamente"})
            
        except InvalidId:
            return Response(
                {"detail": "ID de calificación inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )


class CalificacionEnviarValidacionView(APIView):
    """Analista/TI envían BORRADOR -> PENDIENTE"""
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["ANALISTA", "TI"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()

    def post(self, request, calificacion_id):
        ok, error = self.calificacion_mongo.cambiar_estado(
            calificacion_id,
            "PENDIENTE",
            request.user.username,
            comentario=request.data.get('comentario', 'Envío a validación')
        )

        if not ok:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'ANALISTA'),
            accion="UPDATE",
            modelo="CalificacionMongo",
            descripcion=f"Envió calificación {calificacion_id} a validación"
        )

        return Response({"detail": "Calificación enviada a validación", "estado": "PENDIENTE"})


class CalificacionResolverView(APIView):
    """Auditor/TI resuelven calificaciones en PENDIENTE"""
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()

    def post(self, request, calificacion_id):
        nuevo_estado = request.data.get('estado')
        if nuevo_estado not in ["APROBADA", "OBSERVADA", "RECHAZADA"]:
            return Response({"detail": "Estado no permitido"}, status=status.HTTP_400_BAD_REQUEST)

        comentario = request.data.get('comentario', '')
        ok, error = self.calificacion_mongo.cambiar_estado(
            calificacion_id,
            nuevo_estado,
            request.user.username,
            comentario=comentario
        )

        if not ok:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener calificación para enviar email
        calificacion = self.calificacion_mongo.obtener_por_id(calificacion_id)

        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'AUDITOR'),
            accion="UPDATE",
            modelo="CalificacionMongo",
            descripcion=f"Resolución {nuevo_estado} sobre calificación {calificacion_id}"
        )

        # 📧 Enviar email al corredor
        if calificacion and calificacion.get('usuario_id'):
            try:
                from django.contrib.auth.models import User
                from src.utils_registro import enviar_email_calificacion_validada
                
                usuario_corredor = User.objects.get(id=calificacion['usuario_id'])
                rut = calificacion.get('rut', 'N/A')
                
                # Mapear estado Mongo a nombre legible
                estado_texto = {
                    "APROBADA": "VALIDADA",
                    "OBSERVADA": "OBSERVADA",
                    "RECHAZADA": "RECHAZADA"
                }.get(nuevo_estado, nuevo_estado)
                
                enviar_email_calificacion_validada(
                    usuario=usuario_corredor,
                    rut=rut,
                    estado=estado_texto,
                    comentarios=comentario
                )
            except Exception as e:
                print(f"Error enviando email de validación: {e}")

        return Response({"detail": "Calificación resuelta", "estado": nuevo_estado})


class CalificacionPendientesView(APIView):
    """Bandeja de calificaciones en PENDIENTE con documentos adjuntos"""
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["AUDITOR", "TI"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()
        self.documento_mongo = DocumentoMongo()

    def get(self, request):
        calificaciones = list(self.calificacion_mongo.collection.find({'estado': 'PENDIENTE'}).sort('fecha_creacion', -1))
        data = []
        for cal in calificaciones:
            cal_id = str(cal['_id'])
            cal['_id'] = cal_id
            cal['fecha_creacion'] = cal['fecha_creacion'].isoformat()
            cal['fecha_actualizacion'] = cal['fecha_actualizacion'].isoformat()
            documentos = self.documento_mongo.listar(
                registro_id=cal.get('registro_id'),
                calificacion_id=cal_id
            )
            cal['documentos'] = documentos
            data.append(cal)

        return Response({"total": len(data), "calificaciones": data})


class DocumentosMongoView(APIView):
    """Gestión de metadatos de documentos en MongoDB"""
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["CORREDOR", "ANALISTA", "TI"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.documento_mongo = DocumentoMongo()

    def get(self, request):
        registro_id = request.query_params.get('registro_id')
        calificacion_id = request.query_params.get('calificacion_id')
        if not registro_id and not calificacion_id:
            return Response({"detail": "registro_id o calificacion_id es requerido"}, status=status.HTTP_400_BAD_REQUEST)

        docs = self.documento_mongo.listar(registro_id=registro_id, calificacion_id=calificacion_id)
        return Response({"total": len(docs), "documentos": docs})

    def post(self, request):
        upload = request.FILES.get('archivo')
        if not upload:
            return Response({"detail": "archivo es requerido"}, status=status.HTTP_400_BAD_REQUEST)

        if upload.content_type not in ["application/pdf", "text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
            return Response({"detail": "Tipo de archivo no permitido"}, status=status.HTTP_400_BAD_REQUEST)

        registro_id = request.data.get('registro_id')
        if not registro_id:
            return Response({"detail": "registro_id es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

        # Guardar archivo en storage local (placeholder de storage externo)
        base_dir = getattr(settings, 'MEDIA_ROOT', os.path.join(settings.BASE_DIR, 'media'))
        save_dir = os.path.join(base_dir, 'documentos')
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, upload.name)

        with open(file_path, 'wb+') as destination:
            for chunk in upload.chunks():
                destination.write(chunk)

        # Hash de integridad
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)

        data = {
            'registro_id': registro_id,
            'calificacion_id': request.data.get('calificacion_id'),
            'tipo_documento': request.data.get('tipo_documento') or upload.content_type,
            'ruta_storage': file_path,
            'hash_integridad': sha256.hexdigest(),
            'metadata': {
                'filename': upload.name,
                'content_type': upload.content_type,
                'size': upload.size,
            },
            'ocr_resultado': request.data.get('ocr_resultado'),
            'estado': request.data.get('estado', 'DOCUMENTO_CARGADO'),
            'creado_por': request.user.username,
        }

        try:
            doc_id = self.documento_mongo.crear(data)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'CORREDOR'),
            accion="CREATE",
            modelo="DocumentoMongo",
            descripcion=f"Carga de documento {doc_id} para registro {data.get('registro_id')}"
        )

        return Response({"detail": "Documento registrado", "id": doc_id, "ruta_storage": file_path}, status=status.HTTP_201_CREATED)


class CalificacionCargaMasivaCSVView(APIView):
    """Carga masiva de calificaciones via CSV (Analista/TI)"""
    permission_classes = [IsAuthenticated, TieneRol]
    roles_permitidos = ["ANALISTA", "TI"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calificacion_mongo = CalificacionMongo()
        self.documento_mongo = DocumentoMongo()

    def post(self, request):
        upload = request.FILES.get('archivo')
        if not upload:
            return Response({"detail": "archivo CSV requerido"}, status=status.HTTP_400_BAD_REQUEST)

        if upload.content_type not in ["text/csv", "application/vnd.ms-excel"]:
            return Response({"detail": "Debe ser CSV"}, status=status.HTTP_400_BAD_REQUEST)

        # Guardar CSV
        base_dir = getattr(settings, 'MEDIA_ROOT', os.path.join(settings.BASE_DIR, 'media'))
        save_dir = os.path.join(base_dir, 'csv')
        os.makedirs(save_dir, exist_ok=True)
        file_path = os.path.join(save_dir, upload.name)
        with open(file_path, 'wb+') as destination:
            for chunk in upload.chunks():
                destination.write(chunk)

        # Registrar documento CSV
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)

        doc_id = self.documento_mongo.crear({
            'registro_id': request.data.get('registro_id'),
            'tipo_documento': 'CSV_CALIFICACIONES',
            'ruta_storage': file_path,
            'hash_integridad': sha256.hexdigest(),
            'metadata': {'filename': upload.name, 'size': upload.size},
            'estado': 'DOCUMENTO_CARGADO',
            'creado_por': request.user.username,
        })

        # Procesar CSV
        creadas = 0
        errores = []
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            expected = {'registro_id', 'rut', 'tipo_certificado', 'periodo', 'monto'}
            if not expected.issubset(set(reader.fieldnames or [])):
                return Response({"detail": "Columnas requeridas: registro_id,rut,tipo_certificado,periodo,monto"}, status=status.HTTP_400_BAD_REQUEST)

            for idx, row in enumerate(reader, start=2):
                try:
                    registro_id = row.get('registro_id')
                    if not registro_id or not Registro.objects.filter(id=registro_id).exists():
                        raise ValueError("registro_id inválido")

                    payload = {
                        'usuario_id': request.user.id,
                        'creado_por_id': request.user.id,
                        'registro_id': int(registro_id),
                        'tipo_certificado': row.get('tipo_certificado'),
                        'rut': row.get('rut'),
                        'periodo': row.get('periodo'),
                        'monto': float(row.get('monto') or 0),
                        'detalles': {},
                        'metadata': {'fuente': 'CSV'},
                        'estado': 'BORRADOR',
                        'documentos': [doc_id],
                    }

                    if not payload['tipo_certificado'] or not payload['rut'] or not payload['periodo']:
                        raise ValueError("Campos obligatorios faltantes")

                    self.calificacion_mongo.crear(payload)
                    creadas += 1
                except Exception as exc:  # capturamos por fila
                    errores.append({"fila": idx, "error": str(exc)})

        Auditoria.objects.create(
            usuario=request.user,
            rol=getattr(request.user.perfil, 'rol', 'ANALISTA'),
            accion="CREATE",
            modelo="CalificacionMongo",
            descripcion=f"Carga masiva CSV doc {doc_id}: creadas={creadas}, errores={len(errores)}"
        )

        return Response({
            "detail": "Carga masiva procesada",
            "creadas": creadas,
            "errores": errores,
            "documento_csv_id": doc_id
        })
