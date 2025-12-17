
# 🗂️ Planificación y Estado Actual del Sistema

Este documento describe la planificación del sistema, su grado de implementación actual y el flujo de funcionamiento de cada módulo y archivo principal.

---

---


## 1. Registro y Activación de Usuario

- **Archivo:** Backend/src/views/auth.py
- **Flujo:**
  1. Usuario se registra → se crea en `auth_user` y `PerfilUsuario` (no activo).
  2. Se envía email con token de verificación.
  3. Usuario hace clic en el enlace del email.
  4. El backend activa el usuario (`is_active=True`).
  5. Se audita el evento de activación en el modelo `Auditoria`.
  6. No se crea ningún registro tributario en este proceso, solo el usuario y su perfil.

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


## Resumen de Flujo de Activación de Usuario

1. Usuario se registra en el sistema.
2. Recibe email de verificación.
3. Al hacer clic en el enlace, el usuario es activado (`is_active=True`).
4. Se registra una auditoría del evento de activación.
5. No se crea ningún registro tributario en este paso.

---


---

## Checklist de Implementación

### Completado
- Registro y activación de usuarios con email y auditoría.
- Autenticación JWT y gestión de tokens (incluye blacklist y rotación).
- Gestión de roles y permisos (RBAC completo).
- Carga y validación de certificados.
- Visualización y descarga de archivos por auditores y analistas.
- Auditoría de todas las acciones críticas.
- Seguridad: hashing Argon2, validaciones, headers, logs.
- Documentación técnica y de seguridad.
- Integración con Docker y pipelines CI/CD.

### Parcialmente Completado
- Pruebas automatizadas (unitarias y de integración básicas).
- Monitoreo inicial (logs locales, sin integración externa avanzada).
- Validaciones avanzadas en algunos endpoints.

### Pendiente
- Pruebas avanzadas de seguridad y performance (pentesting, fuzzing, monitoreo externo).
- Integración de monitoreo en tiempo real (Grafana, Prometheus, etc.).
- Mejoras en la cobertura de tests y escenarios de error.

---

Con esto, el proyecto queda cerrado a nivel documental y listo para:

- Evaluación
- Defensa técnica
- O continuación en una siguiente entrega

**Última actualización:** 17 de diciembre de 2025
