from django.contrib.auth.models import User
from django.db import models
import secrets
from datetime import timedelta
from django.utils import timezone

# ===============================
# PAÍSES Y VALIDACIONES
# ===============================
PAISES_CHOICES = [
    ('CHILE', 'Chile'),
    ('COLOMBIA', 'Colombia'),
    ('PERU', 'Perú'),
]

PREFIJOS_TELEFONICOS = {
    'CHILE': '+56',
    'COLOMBIA': '+57',
    'PERU': '+51',
}

# ===============================
# REGISTROS
# ===============================
class Registro(models.Model):
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="registros"
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo


# ===============================
# CALIFICACIONES
# ===============================
class Calificacion(models.Model):
    ESTADO_CHOICES = [
        ("BORRADOR", "Borrador"),
        ("PENDIENTE", "Pendiente de validación"),
        ("VALIDADA", "Validada"),
        ("OBSERVADA", "Observada"),
        ("RECHAZADA", "Rechazada"),
        ("HISTORICA", "Histórica"),
    ]

    registro = models.ForeignKey(
        Registro,
        on_delete=models.CASCADE,
        related_name="calificaciones"
    )

    creado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="calificaciones_creadas"
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default="BORRADOR"
    )

    comentario = models.TextField(blank=True)
    solicitar_auditoria = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Calificación {self.id} - {self.estado}"


# ===============================
# PERFIL DE USUARIO / RBAC
# ===============================
class PerfilUsuario(models.Model):
    ROL_CHOICES = [
        ('CORREDOR', 'Corredor de inversión'),
        ('ANALISTA', 'Analista tributario'),
        ('AUDITOR', 'Auditor interno'),
        ('TI', 'Administrador TI'),
    ]

    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="perfil"
    )
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)
    
    # Perfil extendido
    foto_perfil = models.ImageField(upload_to='perfiles/%Y/%m/', null=True, blank=True)
    biografia = models.TextField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    
    # MFA
    mfa_habilitado = models.BooleanField(default=False)
    mfa_secret = models.CharField(max_length=32, blank=True)
    
    # Control de cambio de rol
    cambio_rol_solicitado = models.BooleanField(default=False)
    
    # Ubicación
    pais = models.CharField(max_length=20, choices=PAISES_CHOICES, default='CHILE')

    def __str__(self):
        return f"{self.usuario.username} ({self.rol}) - {self.pais}"


# ===============================
# REGLAS DE NEGOCIO
# ===============================
class ReglaNegocio(models.Model):
    ESTADO_CHOICES = [
        ("ACTIVA", "Activa"),
        ("INACTIVA", "Inactiva"),
        ("DEPRECADA", "Deprecada"),
        ("REVISION", "En revisión"),
    ]

    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    condicion = models.TextField()
    accion = models.TextField()

    version = models.IntegerField(default=1)
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default="REVISION"
    )

    creado_por = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="reglas_creadas"
    )

    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nombre} v{self.version} ({self.estado})"


# ===============================
# HISTORIAL DE VERSIONES DE REGLAS
# ===============================
class HistorialReglaNegocio(models.Model):
    """Guarda snapshot completo de cada versión de regla"""
    regla_actual = models.ForeignKey(
        ReglaNegocio,
        on_delete=models.CASCADE,
        related_name="historial_versiones"
    )
    
    # Snapshot de datos en esa versión
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    condicion = models.TextField()
    accion = models.TextField()
    version = models.IntegerField()
    estado = models.CharField(max_length=20)
    
    # Metadata del cambio
    modificado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="versiones_reglas"
    )
    fecha_snapshot = models.DateTimeField(auto_now_add=True)
    comentario = models.TextField(blank=True, help_text="Razón del cambio")
    
    class Meta:
        ordering = ['-version']
    
    def __str__(self):
        return f"{self.nombre} v{self.version} (snapshot {self.fecha_snapshot.strftime('%Y-%m-%d %H:%M')})"


# ===============================
# CERTIFICADOS
# ===============================
class Certificado(models.Model):
    TIPO_CHOICES = [
        ("AFP", "AFP - Administradora de Fondos de Pensiones"),
        ("APV", "APV - Ahorro Previsional Voluntario"),
        ("ISAPRE", "ISAPRE"),
        ("FONASA", "FONASA"),
        ("SEGURO_VIDA", "Seguro de Vida"),
        ("SEGURO_CESANTIA", "Seguro de Cesantía"),
        ("OTRO", "Otro"),
    ]

    ESTADO_CHOICES = [
        ("CARGADO", "Cargado"),
        ("VALIDADO", "Validado"),
        ("RECHAZADO", "Rechazado"),
    ]

    # Relaciones
    registro = models.ForeignKey(
        Registro,
        on_delete=models.CASCADE,
        related_name="certificados"
    )
    
    calificacion = models.ForeignKey(
        Calificacion,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificados"
    )

    cargado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="certificados_cargados"
    )

    # Datos del certificado
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    archivo = models.FileField(upload_to="certificados/%Y/%m/", max_length=500)
    nombre_archivo = models.CharField(max_length=255)
    tamanio_bytes = models.PositiveIntegerField()
    mime_type = models.CharField(max_length=100, default="application/pdf")
    
    # Metadatos
    metadatos = models.JSONField(
        default=dict,
        blank=True,
        help_text="Información adicional extraída del certificado (OCR, fechas, montos)"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default="CARGADO"
    )
    
    # Auditoría
    fecha_carga = models.DateTimeField(auto_now_add=True)
    fecha_validacion = models.DateTimeField(null=True, blank=True)
    validado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificados_validados"
    )
    observaciones = models.TextField(blank=True)

    class Meta:
        ordering = ['-fecha_carga']
        indexes = [
            models.Index(fields=['tipo', 'estado']),
            models.Index(fields=['registro', 'tipo']),
        ]

    def __str__(self):
        return f"{self.get_tipo_display()} - {self.nombre_archivo}"


# ===============================
# AUDITORÍA (ÚNICA Y FINAL)
# ===============================
class Auditoria(models.Model):
    ACCION_CHOICES = [
        ("CREATE", "Creación"),
        ("UPDATE", "Actualización"),
        ("DELETE", "Eliminación"),
        ("LOGIN", "Inicio de sesión"),
        ("LOGOUT", "Cierre de sesión"),
        ("RULE", "Regla aplicada"),
        ("ESTADO_CAMBIO", "Cambio de estado"),
        ("RESOLUCION", "Resolución"),
    ]

    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    rol = models.CharField(max_length=20)
    accion = models.CharField(max_length=20, choices=ACCION_CHOICES)
    modelo = models.CharField(max_length=100)
    objeto_id = models.PositiveIntegerField(null=True, blank=True)
    descripcion = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    metadatos = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['usuario', 'fecha']),
            models.Index(fields=['accion', 'modelo']),
        ]

    def __str__(self):
        return f"[{self.fecha}] {self.accion} - {self.modelo}"

class Feedback(models.Model):
    """Retroalimentación general del sistema"""
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']
        verbose_name_plural = "Feedback"

    def __str__(self):
        return f"Feedback {self.id} - {self.fecha.strftime('%Y-%m-%d')}"


class CasoSoporte(models.Model):
    """Casos de soporte/ayuda generados por usuarios"""
    
    PRIORIDAD_CHOICES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
        ('CRÍTICA', 'Crítica'),
    ]
    
    ESTADO_CHOICES = [
        ('ABIERTO', 'Abierto'),
        ('EN_PROGRESO', 'En Progreso'),
        ('RESUELTO', 'Resuelto'),
        ('CERRADO', 'Cerrado'),
    ]
    
    TIPO_CHOICES = [
        ('CONSULTA', 'Consulta'),
        ('PROBLEMA', 'Problema'),
        ('MOLESTIA', 'Molestia'),
        ('SUGERENCIA', 'Sugerencia'),
    ]
    
    # Datos básicos
    id_caso = models.CharField(max_length=20, unique=True, editable=False)  # CASE-001, CASE-002, etc
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="casos_soporte"
    )
    email = models.EmailField()
    nombre = models.CharField(max_length=150)
    
    # Detalles del caso
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='CONSULTA')
    prioridad = models.CharField(max_length=20, choices=PRIORIDAD_CHOICES, default='MEDIA')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ABIERTO')
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    
    # Seguimiento
    email_contacto_enviado = models.BooleanField(default=False)
    respuesta_admin = models.TextField(blank=True, null=True)
    respondido_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="casos_respondidos"
    )
    
    class Meta:
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['estado', '-fecha_creacion']),
            models.Index(fields=['id_caso']),
        ]
    
    def __str__(self):
        return f"{self.id_caso} - {self.titulo}"
    
    def save(self, *args, **kwargs):
        """Generar ID único del caso si no existe"""
        if not self.id_caso:
            # Obtener último ID y incrementar
            last_case = CasoSoporte.objects.order_by('-id')[:1]
            if last_case:
                last_num = int(last_case[0].id_caso.split('-')[1])
                self.id_caso = f"CASE-{last_num + 1:06d}"
            else:
                self.id_caso = "CASE-000001"
        
        super().save(*args, **kwargs)


# ===============================
# CORREOS ADICIONALES
# ===============================
class CorreoAdicional(models.Model):
    """
    Correos adicionales asociados a un usuario
    """
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="correos_adicionales"
    )
    email = models.EmailField()
    verificado = models.BooleanField(default=False)
    principal = models.BooleanField(default=False)
    fecha_agregado = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['usuario', 'email']
        ordering = ['-principal', '-fecha_agregado']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.email}"


# ===============================
# SOLICITUDES DE CAMBIO DE ROL
# ===============================
class SolicitudCambioRol(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('APROBADA', 'Aprobada'),
        ('RECHAZADA', 'Rechazada'),
    ]
    
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="solicitudes_rol"
    )
    rol_actual = models.CharField(max_length=20)
    rol_solicitado = models.CharField(max_length=20, choices=PerfilUsuario.ROL_CHOICES)
    justificacion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    fecha_solicitud = models.DateTimeField(auto_now_add=True)
    fecha_respuesta = models.DateTimeField(null=True, blank=True)
    respondido_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="solicitudes_respondidas"
    )
    comentario_admin = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-fecha_solicitud']
    
    def __str__(self):
        return f"{self.usuario.username}: {self.rol_actual} → {self.rol_solicitado} ({self.estado})"


# ===============================
# VERIFICACIÓN DE EMAIL
# ===============================
class VerificacionEmail(models.Model):
    """
    Token de verificación para nuevos usuarios
    Se crea al registrarse, se valida al confirmar email
    """
    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="verificacion_email"
    )
    token = models.CharField(max_length=64, unique=True)
    email_a_verificar = models.EmailField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    verificado = models.BooleanField(default=False)
    fecha_verificacion = models.DateTimeField(null=True, blank=True)
    
    def es_valido(self):
        """Token válido solo por 24 horas"""
        if self.verificado:
            return False
        expiracion = self.fecha_creacion + timedelta(hours=24)
        return timezone.now() < expiracion
    
    @classmethod
    def generar_token(cls):
        """Generar token único de 64 caracteres"""
        return secrets.token_urlsafe(48)
    
    def __str__(self):
        return f"Verificación - {self.usuario.username} ({self.email_a_verificar})"
