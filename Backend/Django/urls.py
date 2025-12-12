from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# ViewSets
from src.views.registros import RegistroViewSet

# Vistas API
from src.views.auth import mi_perfil
from src.views.certificados import CargaCertificadosView
from src.views.validacion import BandejaValidacionView
from src.views.calificaciones import CalificacionView
from src.views.auditoria import AuditoriaView
from src.views.reglas_negocio import ReglasNegocioView

# Router principal
router = DefaultRouter()
router.register(r"registros", RegistroViewSet, basename="registros")

urlpatterns = [
    # Admin Django
    path("admin/", admin.site.urls),

    # =========================
    # AUTENTICACIÓN (JWT)
    # =========================
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # =========================
    # PERFIL USUARIO
    # =========================
    path("api/perfil/", mi_perfil, name="mi_perfil"),

    # =========================
    # MÓDULOS CON RBAC
    # =========================
    path("api/certificados/", CargaCertificadosView.as_view(), name="certificados"),
    path("api/validacion/", BandejaValidacionView.as_view(), name="validacion"),
    path("api/calificaciones/", CalificacionView.as_view(), name="calificaciones"),
    path("api/auditoria/", AuditoriaView.as_view(), name="auditoria"),
    path("api/reglas-negocio/", ReglasNegocioView.as_view(), name="reglas_negocio"),

    # =========================
    # API PRINCIPAL (ViewSets)
    # =========================
    path("api/", include(router.urls)),
]
