from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User

from .models import Registro, Auditoria, Calificacion


# -------------------------------
# UTILIDAD: obtener rol
# -------------------------------
def obtener_rol(user):
    if not user:
        return "DESCONOCIDO"
    if user.is_superuser:
        return "ADMIN"
    perfil = getattr(user, "perfil", None)
    return perfil.rol if perfil else "SIN_ROL"


# ===============================
# REGISTRO — CREATE / UPDATE
# ===============================
@receiver(post_save, sender=Registro)
def auditar_registro_save(sender, instance, created, **kwargs):
    Auditoria.objects.create(
        usuario=instance.usuario,
        rol=obtener_rol(instance.usuario),
        accion="CREATE" if created else "UPDATE",
        modelo="Registro",
        objeto_id=instance.id,
        descripcion=(
            f"Registro creado: {instance.titulo}"
            if created
            else f"Registro modificado: {instance.titulo}"
        ),
    )


# ===============================
# REGISTRO — DELETE
# ===============================
@receiver(post_delete, sender=Registro)
def auditar_registro_delete(sender, instance, **kwargs):
    Auditoria.objects.create(
        usuario=instance.usuario,
        rol=obtener_rol(instance.usuario),
        accion="DELETE",
        modelo="Registro",
        objeto_id=instance.id,
        descripcion=f"Registro eliminado: {instance.titulo}",
    )


# ===============================
# CALIFICACIÓN — CREATE / UPDATE
# ===============================
@receiver(post_save, sender=Calificacion)
def auditar_calificacion_save(sender, instance, created, **kwargs):
    usuario = instance.creado_por

    Auditoria.objects.create(
        usuario=usuario,
        rol=obtener_rol(usuario),
        accion="CREATE" if created else "UPDATE",
        modelo="Calificacion",
        objeto_id=instance.id,
        descripcion=(
            f"Calificación creada ({instance.estado}) "
            f"para registro ID {instance.registro.id}"
            if created
            else f"Calificación actualizada ({instance.estado}) "
                 f"para registro ID {instance.registro.id}"
        ),
    )
