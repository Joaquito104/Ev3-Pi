from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from src.views.perfil import PerfilUsuarioView
from src.views.perfil_completo import (
    PerfilUsuarioView as PerfilCompletoView,
    CorreoAdicionalView,
    SolicitudCambioRolView,
    MFAConfigView,
    GestionSolicitudesRolView,
)
from src.views.feedback import FeedbackView
from src.views.auth import mi_perfil, registrar_usuario, RegistroView, VerificarEmailView, ReenviarVerificacionView, LoginMFAView
from src.views.jwt_auth import LogoutView, RefreshTokenView, TokenStatsView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# =========================
# VIEWSETS
# =========================
from src.views.registros import RegistroViewSet

# =========================
# VISTAS API
# =========================
from src.views.auth import mi_perfil
from src.views.certificados import CargaCertificadosView
from src.views.certificados_upload import (
    CertificadoUploadView,
    CertificadoListView,
    CertificadoDetailView,
)
from src.views.calificaciones import CalificacionView
from src.views.calificaciones_mongo import (
    CalificacionCorredorView,
    CalificacionCorredorDetailView,
    CalificacionEstadisticasView,
    CalificacionAnalistaView,
    CalificacionEnviarValidacionView,
    CalificacionResolverView,
    CalificacionPendientesView,
    DocumentosMongoView,
    CalificacionCargaMasivaCSVView,
)
from src.views.calificaciones_update import CalificacionCorredorUpdateView
from src.views.auditoria import AuditoriaView, AuditoriaEstadisticasView
from src.views.reglas_negocio import ReglasNegocioView, ReglaNegocioDetailView
from src.views.historial_reglas import HistorialReglaView, RollbackReglaView, CompararVersionesView
from src.views.usuarios import UsuariosView, UsuarioDetailView

# ADMIN GLOBAL (Superusuario)
from src.views.admin_global import (
    EstadoSistemaView,
    ResetPasswordView,
    BloquearDesbloquearUsuarioView,
    AuditoriaGlobalView,
    PurgaDatosView,
)

# VALIDACIÓN
from src.views.validacion import (
    BandejaValidacionView,
    ValidarCalificacionView,
    EnviarValidacionView,
)

# =========================
# ROUTER
# =========================
router = DefaultRouter()
router.register(r"registros", RegistroViewSet, basename="registros")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/perfil/editar/", PerfilUsuarioView.as_view()),
    path("api/feedback/", FeedbackView.as_view()),

    # ---------- AUTH ----------
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("api/login-mfa/", LoginMFAView.as_view(), name="login_mfa"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
    path("api/token-stats/", TokenStatsView.as_view(), name="token_stats"),
    path("api/perfil/", mi_perfil, name="mi_perfil"),
    path("api/registro/", registrar_usuario),
    
    # NUEVO SISTEMA DE REGISTRO
    path("api/registro-completo/", RegistroView.as_view()),
    path("api/verificar-email/", VerificarEmailView.as_view()),
    path("api/reenviar-verificacion/", ReenviarVerificacionView.as_view()),
    
    # ---------- PERFIL COMPLETO ----------
    path("api/perfil-completo/", PerfilCompletoView.as_view()),
    path("api/correos-adicionales/", CorreoAdicionalView.as_view()),
    path("api/solicitud-cambio-rol/", SolicitudCambioRolView.as_view()),
    path("api/mfa-config/", MFAConfigView.as_view()),
    path("api/admin/solicitudes-rol/", GestionSolicitudesRolView.as_view()),
    path("api/admin/solicitudes-rol/<int:solicitud_id>/", GestionSolicitudesRolView.as_view()),



    # ---------- MÓDULOS ----------
    path("api/certificados/", CargaCertificadosView.as_view()),
    
    # CERTIFICADOS (Upload/Validación)
    path("api/certificados-upload/", CertificadoUploadView.as_view()),
    path("api/certificados-list/", CertificadoListView.as_view()),
    path("api/certificados-detail/<int:certificado_id>/", CertificadoDetailView.as_view()),
    
    path("api/calificaciones/", CalificacionView.as_view()),  # Antigua (PostgreSQL)
    path("api/calificaciones/<int:calificacion_id>/enviar/", EnviarValidacionView.as_view()),
    
    # CALIFICACIONES MONGODB (Corredor)
    path("api/calificaciones-corredor/", CalificacionCorredorView.as_view()),
    path("api/calificaciones-corredor/estadisticas/", CalificacionEstadisticasView.as_view()),
    path("api/calificaciones-corredor/<str:calificacion_id>/", CalificacionCorredorDetailView.as_view()),
    path("api/calificaciones-corredor/<str:calificacion_id>/actualizar/", CalificacionCorredorUpdateView.as_view()),
    
    # CALIFICACIONES MONGODB (Analista)
    path("api/calificaciones-analista/", CalificacionAnalistaView.as_view()),
    path("api/calificaciones-analista/<str:calificacion_id>/", CalificacionAnalistaView.as_view()),
    path("api/calificaciones-analista/<str:calificacion_id>/enviar/", CalificacionEnviarValidacionView.as_view()),

    # BANDEJA VALIDACIÓN / RESOLUCIÓN
    path("api/calificaciones-pendientes/", CalificacionPendientesView.as_view()),
    path("api/calificaciones-pendientes/<str:calificacion_id>/resolver/", CalificacionResolverView.as_view()),

    # DOCUMENTOS MONGODB
    path("api/documentos/", DocumentosMongoView.as_view()),

    # CARGA MASIVA CSV
    path("api/calificaciones-csv/", CalificacionCargaMasivaCSVView.as_view()),

    # VALIDACIÓN
    path("api/validacion/", BandejaValidacionView.as_view()),
    path("api/validacion/<int:calificacion_id>/", ValidarCalificacionView.as_view()),

    # AUDITORÍA
    path("api/auditoria/", AuditoriaView.as_view()),
    path("api/auditoria/estadisticas/", AuditoriaEstadisticasView.as_view()),

    # REGLAS
    path("api/reglas-negocio/", ReglasNegocioView.as_view()),
    path("api/reglas-negocio/<int:pk>/", ReglaNegocioDetailView.as_view()),
    path("api/reglas-negocio/<int:pk>/historial/", HistorialReglaView.as_view()),
    path("api/reglas-negocio/<int:pk>/rollback/", RollbackReglaView.as_view()),
    path("api/reglas-negocio/<int:pk>/comparar/", CompararVersionesView.as_view()),

    # USUARIOS
    path("api/usuarios/", UsuariosView.as_view()),
    path("api/usuarios/<int:pk>/", UsuarioDetailView.as_view()),

    # ADMIN GLOBAL (Solo Superusuarios)
    path("api/admin-global/estado/", EstadoSistemaView.as_view()),
    path("api/admin-global/reset-password/", ResetPasswordView.as_view()),
    path("api/admin-global/bloquear-usuario/", BloquearDesbloquearUsuarioView.as_view()),
    path("api/admin-global/auditoria/", AuditoriaGlobalView.as_view()),
    path("api/admin-global/purgar-datos/", PurgaDatosView.as_view()),

    # VIEWSETS
    path("api/", include(router.urls)),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
