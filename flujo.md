# 🗂️ Flujo del Sistema - Proyecto de Gestión Tributaria

Este documento describe el flujo general del sistema, explicando la función de cada archivo principal, las acciones clave y el uso de los módulos en el proyecto.

---

## 1. Registro y Verificación de Usuario

- **Archivo:** Backend/src/views/auth.py
- **Acción:**
  - El usuario se registra mediante un endpoint de registro.
  - Se crea un usuario en `auth_user` (modelo User de Django) y un perfil en `PerfilUsuario`.
  - Se envía un email con token de verificación.
  - Al verificar el email, se activa el usuario (`is_active=True`) y se marca el correo como verificado.
  - Se audita la acción en el modelo `Auditoria`.

## 2. Login y Autenticación JWT

- **Archivo:** Backend/src/views/auth.py
- **Acción:**
  - El usuario inicia sesión y recibe un JWT (access y refresh token).
  - El backend valida el token en cada request protegido.
  - Se usa Redis para blacklist de tokens en logout o rotación.

## 3. Gestión de Registros

- **Archivo:** Backend/src/views/registros.py
- **Acción:**
  - Los usuarios pueden consultar registros según su rol.
  - Corredores solo ven sus registros; auditores, analistas y TI ven todos.
  - Los registros se almacenan en el modelo `Registro`.

## 4. Carga y Validación de Certificados

- **Archivo:** Backend/src/views/certificados.py
- **Acción:**
  - Corredores, analistas y admins pueden subir archivos de certificados.
  - El archivo se almacena en el modelo `Certificado` (campo `archivo`).
  - El auditor puede ver y descargar cualquier certificado.

## 5. Calificaciones y Procesamiento

- **Archivo:** Backend/src/views/calificaciones.py, calificaciones_mongo.py
- **Acción:**
  - Analistas procesan y validan calificaciones asociadas a registros y certificados.
  - Se pueden cargar calificaciones en lote (CSV, Excel).
  - El estado de la calificación se actualiza y se audita.

## 6. Roles y Permisos

- **Archivo:** Backend/src/permissions.py, Backend/src/rbac.py
- **Acción:**
  - El acceso a endpoints y acciones está controlado por el rol del usuario (`PerfilUsuario`).
  - Permisos personalizados aseguran que cada rol solo pueda realizar acciones permitidas.

## 7. Auditoría y Seguridad

- **Archivo:** Backend/src/models.py (Auditoria), Backend/scripts/check_security.py
- **Acción:**
  - Todas las acciones críticas (registro, login, cambios, validaciones) se auditan.
  - Los logs se almacenan en `logs/security.log`.
  - Scripts automáticos revisan la seguridad y credenciales.

## 8. Configuración y Variables de Entorno

- **Archivo:** Backend/Django/settings.py, Backend/.env.example
- **Acción:**
  - Configuración de base de datos, JWT, Redis, MongoDB, email, seguridad.
  - Variables sensibles se gestionan por `.env` (no se sube al repo).

## 9. Frontend

- **Directorio:** FrontEnd/
- **Acción:**
  - React gestiona la interfaz, rutas protegidas, login, dashboards y carga de archivos.
  - Se conecta al backend vía API REST.

## 10. Documentación y Deploy

- **Archivos:** README.md, SECURITY.md, DEPLOY.md, MODO_OSCURO.md, flujo.md
- **Acción:**
  - Documentación de instalación, seguridad, despliegue y flujos.
  - Docker y GitHub Actions para CI/CD.

---

## Resumen de Flujo

1. Usuario se registra → recibe email → verifica cuenta (se activa en auth_user).
2. Inicia sesión → obtiene JWT → accede a funcionalidades según su rol.
3. Corredor sube certificados → quedan asociados a su usuario.
4. Auditor/analista revisa registros y certificados, valida o rechaza.
5. Todas las acciones quedan auditadas.
6. Seguridad y configuración centralizadas en settings y .env.

---

**Última actualización:** 17 de diciembre de 2025
