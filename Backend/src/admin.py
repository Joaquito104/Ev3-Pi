from django.contrib import admin
from .models import Registro, PerfilUsuario

@admin.register(Registro)
class RegistroAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'usuario', 'fecha')
    list_filter = ('usuario', 'fecha')

@admin.register(PerfilUsuario)
class PerfilUsuarioAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'rol')
    list_filter = ('rol',)
from .models import ReglaNegocio


@admin.register(ReglaNegocio)
class ReglaNegocioAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nombre",
        "version",
        "estado",
        "creado_por",
        "fecha_creacion",
    )
    list_filter = ("estado", "version")
    search_fields = ("nombre", "descripcion")
    readonly_fields = ("fecha_creacion", "fecha_modificacion")
from .models import Auditoria

from .models import Calificacion

@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ("id", "registro", "estado", "fecha_creacion")
    list_filter = ("estado",)

from .models import Auditoria


@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = (
        "fecha",
        "usuario",
        "rol",
        "accion",
        "modelo",
        "objeto_id",
    )
    list_filter = ("accion", "rol", "modelo")
    search_fields = ("usuario__username", "descripcion")
