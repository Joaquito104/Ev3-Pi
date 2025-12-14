from django.contrib.auth.models import User
from django.db import models

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

    def __str__(self):
        return f"{self.usuario.username} ({self.rol})"


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
# AUDITORÍA (ÚNICA Y FINAL)
# ===============================
class Auditoria(models.Model):
    ACCION_CHOICES = [
        ("CREATE", "Creación"),
        ("UPDATE", "Actualización"),
        ("DELETE", "Eliminación"),
        ("LOGIN", "Inicio de sesión"),
        ("RULE", "Regla aplicada"),
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

    def __str__(self):
        return f"[{self.fecha}] {self.accion} - {self.modelo}"
