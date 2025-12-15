"""
Conexión y utilidades para MongoDB
Gestiona calificaciones y documentos en base de datos no estructurada
"""
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import OperationFailure
from django.conf import settings
from bson.objectid import ObjectId


class MongoDBConnection:
    """Singleton para conexión MongoDB"""
    _instance = None
    _client = None
    _db = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBConnection, cls).__new__(cls)
            cls._instance._connect()
        return cls._instance

    def _connect(self):
        """Establecer conexión con MongoDB"""
        config = settings.MONGODB_CONFIG

        # Preferir URI completa (Atlas o TLS)
        uri = config.get('uri')
        if uri:
            self._client = MongoClient(uri)
            self._db = self._client[config['db_name']]
            return

        # Construir URI manual con opciones
        use_auth = bool(config['username'] and config['password'])
        auth = f"{config['username']}:{config['password']}@" if use_auth else ""

        base_uri = f"mongodb://{auth}{config['host']}:{config['port']}/{config['db_name']}"
        params = []
        if use_auth:
            params.append(f"authSource={config.get('auth_source', 'admin')}")
            params.append(f"authMechanism={config.get('auth_mechanism', 'SCRAM-SHA-256')}")
        query = f"?{'&'.join(params)}" if params else ""
        connection_string = f"{base_uri}{query}"

        tls_kwargs = {}
        use_tls = config.get('use_tls')

        # Si es localhost/127.0.0.1 forzamos sin TLS para evitar handshake fallido
        if config.get('host') in ['localhost', '127.0.0.1']:
            use_tls = False

        if use_tls:
            tls_kwargs['tls'] = True
            if config.get('tls_ca_file'):
                tls_kwargs['tlsCAFile'] = config['tls_ca_file']
            if config.get('tls_allow_invalid'):
                tls_kwargs['tlsAllowInvalidCertificates'] = True

        try:
            self._client = MongoClient(connection_string, **tls_kwargs)
            self._db = self._client[config['db_name']]
            # Probar autenticación de inmediato
            self._client.admin.command('ping')
        except OperationFailure as exc:
            # Código 18 = AuthenticationFailed
            if exc.code == 18 and use_auth:
                # Reintentar sin credenciales (entorno local sin auth)
                connection_string_no_auth = f"mongodb://{config['host']}:{config['port']}/{config['db_name']}"
                self._client = MongoClient(connection_string_no_auth, **tls_kwargs)
                self._db = self._client[config['db_name']]
            else:
                raise
        except Exception:
            # Reintentar sin TLS si falla el handshake
            self._client = MongoClient(connection_string)
            self._db = self._client[config['db_name']]

    @property
    def db(self):
        """Retornar instancia de base de datos"""
        return self._db

    @property
    def client(self):
        """Retornar cliente MongoDB"""
        return self._client


def get_mongo_db():
    """Helper para obtener DB de MongoDB"""
    return MongoDBConnection().db


class CalificacionMongo:
    """
    Modelo para Calificaciones en MongoDB
    Estructura no rígida para datos tributarios
    """

    def __init__(self):
        self.collection = get_mongo_db()['calificaciones']
        self._create_indexes()

    def _create_indexes(self):
        """Crear índices para optimizar consultas"""
        # Índice por registro_id (relación con PostgreSQL)
        self.collection.create_index('registro_id')
        # Índice por usuario_id (para filtrar por corredor)
        self.collection.create_index('usuario_id')
        # Índice por estado
        self.collection.create_index('estado')
        # Índice compuesto para consultas frecuentes
        self.collection.create_index([('usuario_id', 1), ('estado', 1)])
        self.collection.create_index([('registro_id', 1), ('estado', 1)])

    def crear(self, data):
        """
        Crear nueva calificación
        data: dict con estructura flexible
        """
        if not data.get('registro_id'):
            raise ValueError("registro_id es obligatorio")
        if not data.get('usuario_id'):
            raise ValueError("usuario_id es obligatorio")

        ahora = datetime.utcnow()
        estado_inicial = data.get('estado', 'BORRADOR')
        historial_estado = {
            'estado': estado_inicial,
            'usuario': data.get('creado_por_id') or data.get('usuario_id'),
            'timestamp': ahora,
            'comentario': 'Creación'
        }

        documento = {
            'registro_id': data.get('registro_id'),
            'usuario_id': data.get('usuario_id'),
            'creado_por_id': data.get('creado_por_id'),
            'estado': estado_inicial,
            'tipo_certificado': data.get('tipo_certificado'),
            'rut': data.get('rut'),
            'periodo': data.get('periodo'),
            'monto': data.get('monto'),
            'detalles': data.get('detalles', {}),  # Flexible
            'metadata': data.get('metadata', {}),  # Flexible
            'comentario': data.get('comentario', ''),
            'documentos': data.get('documentos', []),
            'ocr_resultados': data.get('ocr_resultados', []),
            'fecha_creacion': ahora,
            'fecha_actualizacion': ahora,
            'historial': [],
            'historial_estados': [historial_estado]
        }

        result = self.collection.insert_one(documento)
        return str(result.inserted_id)

    def obtener_por_id(self, calificacion_id):
        """Obtener calificación por ID de MongoDB"""
        return self.collection.find_one({'_id': ObjectId(calificacion_id)})

    def obtener_por_usuario(self, usuario_id, filtros=None):
        """
        Obtener todas las calificaciones de un usuario (Corredor)
        filtros: dict opcional para filtrar por estado, periodo, etc
        """
        query = {'usuario_id': usuario_id}

        if filtros:
            if filtros.get('estado'):
                query['estado'] = filtros['estado']
            if filtros.get('periodo'):
                query['periodo'] = filtros['periodo']
            if filtros.get('tipo_certificado'):
                query['tipo_certificado'] = filtros['tipo_certificado']

        return list(self.collection.find(query).sort('fecha_creacion', -1))

    def actualizar(self, calificacion_id, data, usuario_modificador):
        """
        Actualizar calificación con historial de cambios
        """
        doc_actual = self.obtener_por_id(calificacion_id)
        if not doc_actual:
            return None

        historial_entry = {
            'timestamp': datetime.utcnow(),
            'modificado_por': usuario_modificador,
            'cambios': data,
            'estado_anterior': doc_actual.get('estado')
        }

        update_data = {
            '$set': {
                **data,
                'fecha_actualizacion': datetime.utcnow()
            },
            '$push': {
                'historial': historial_entry
            }
        }

        result = self.collection.update_one(
            {'_id': ObjectId(calificacion_id)},
            update_data
        )

        return result.modified_count > 0

    def eliminar(self, calificacion_id):
        """Eliminar calificación (soft delete)"""
        result = self.collection.update_one(
            {'_id': ObjectId(calificacion_id)},
            {'$set': {'estado': 'ELIMINADA', 'fecha_eliminacion': datetime.utcnow()}}
        )
        return result.modified_count > 0

    def cambiar_estado(self, calificacion_id, nuevo_estado, usuario, comentario=""):
        """Transicionar estado con trazabilidad"""
        doc_actual = self.obtener_por_id(calificacion_id)
        if not doc_actual:
            return False, "Calificación no encontrada"

        estado_actual = doc_actual.get('estado')
        transiciones_permitidas = {
            'BORRADOR': ['PENDIENTE'],
            'PENDIENTE': ['APROBADA', 'OBSERVADA', 'RECHAZADA'],
            'OBSERVADA': ['BORRADOR', 'PENDIENTE'],
        }

        if nuevo_estado not in transiciones_permitidas.get(estado_actual, []):
            return False, f"Transición {estado_actual} -> {nuevo_estado} no permitida"

        historial_estado = {
            'estado': nuevo_estado,
            'usuario': usuario,
            'timestamp': datetime.utcnow(),
            'comentario': comentario
        }

        update_data = {
            '$set': {
                'estado': nuevo_estado,
                'fecha_actualizacion': datetime.utcnow(),
                'comentario': comentario or doc_actual.get('comentario', '')
            },
            '$push': {
                'historial_estados': historial_estado
            }
        }

        result = self.collection.update_one({'_id': ObjectId(calificacion_id)}, update_data)
        return result.modified_count > 0, ""

    def obtener_estadisticas(self, usuario_id):
        """
        Obtener estadísticas de calificaciones para dashboard de Corredor
        """
        pipeline = [
            {'$match': {'usuario_id': usuario_id}},
            {'$group': {
                '_id': '$estado',
                'total': {'$sum': 1},
                'monto_total': {'$sum': '$monto'}
            }}
        ]

        resultados = list(self.collection.aggregate(pipeline))

        stats = {
            'por_estado': {},
            'total': 0,
            'monto_total': 0
        }

        for item in resultados:
            estado = item['_id']
            total = item['total']
            monto = item.get('monto_total', 0) or 0

            stats['por_estado'][estado] = total
            stats['total'] += total
            stats['monto_total'] += monto

        return stats


class DocumentoMongo:
    """Colección de documentos y metadatos (storage externo)"""

    def __init__(self):
        self.collection = get_mongo_db()['documentos']
        self._create_indexes()

    def _create_indexes(self):
        self.collection.create_index('registro_id')
        self.collection.create_index('calificacion_id')
        self.collection.create_index('estado')

    def crear(self, data):
        if not data.get('registro_id'):
            raise ValueError("registro_id es obligatorio")

        ahora = datetime.utcnow()
        doc = {
            'registro_id': data.get('registro_id'),
            'calificacion_id': data.get('calificacion_id'),
            'tipo_documento': data.get('tipo_documento'),
            'ruta_storage': data.get('ruta_storage'),
            'hash_integridad': data.get('hash_integridad'),
            'estado': data.get('estado', 'DOCUMENTO_CARGADO'),
            'metadata': data.get('metadata', {}),
            'ocr_resultado': data.get('ocr_resultado'),
            'creado_por': data.get('creado_por'),
            'fecha_creacion': ahora,
            'fecha_actualizacion': ahora,
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)

    def listar(self, registro_id=None, calificacion_id=None):
        filtro = {}
        if registro_id:
            filtro['registro_id'] = registro_id
        if calificacion_id:
            filtro['calificacion_id'] = calificacion_id
        return [
            {**doc, '_id': str(doc['_id'])}
            for doc in self.collection.find(filtro).sort('fecha_creacion', -1)
        ]
