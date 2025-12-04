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
    