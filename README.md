# Ev3-Pi - Sistema de Gestión Tributaria

Sistema integral de gestión tributaria y certificados digitales con autenticación JWT, roles basados en permisos y auditoría completa.

---

## Cómo Ejecutar el Proyecto

### Requisitos Previos
- Python 3.11+
- Node.js 18+
- PostgreSQL 12+
- Git

### Instalación y Ejecución

#### 1. Backend (Django)

Sigue estos pasos en Windows para iniciar el backend (comandos listos para copiar/pegar).

1) Abrir la carpeta y activar el virtualenv

PowerShell:

```powershell
cd 'C:\Users\ESTEBAN\Desktop\Ev3-Pi\Backend'
.\ven\Scripts\Activate.ps1
```

cmd.exe:

```cmd
cd C:\Users\ESTEBAN\Desktop\Ev3-Pi\Backend
.\ven\Scripts\activate.bat
```

Si no existe `ven`, créalo y actívalo:

```powershell
python -m venv ven
.\ven\Scripts\Activate.ps1
```

2) Instalar dependencias

```powershell
pip install -r requirements.txt
```

3) Crear `Backend/.env` a partir de la plantilla

Usa `Backend/.env.example` como plantilla. Crea `Backend/.env` y pega (ajusta valores):

```
SECRET_KEY=YOUR_SECRET_KEY
DEBUG=True
DB_NAME=test
DB_USER=test
PASSWORD=YOUR_DB_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=5432
PGCLIENTENCODING=UTF8
ALLOWED_HOSTS=localhost,127.0.0.1
```

IMPORTANTE: no dejes espacios al final de las líneas (p. ej. `DB_HOST=127.0.0.1 `). Un espacio final rompe la resolución del host.

4) Iniciar PostgreSQL si no está corriendo (opcional)

Si tienes PostgreSQL instalado localmente (ejemplo: PostgreSQL 18):

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' start -D 'C:\Program Files\PostgreSQL\18\data' -w
```

Comprobar que escucha en 5432:

```powershell
netstat -ano | Select-String ":5432"
```

Alternativa: usar Docker (rápido para pruebas):

```powershell
docker run --name ev3pi-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:15
```

5) Crear base de datos y usuario (si hace falta)

Si tienes la contraseña del superuser `postgres`:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -U postgres -c "CREATE USER test WITH PASSWORD '1234';"
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -U postgres -c "CREATE DATABASE test OWNER test ENCODING 'UTF8' TEMPLATE template0;"
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE test TO test;"
```

Si NO conoces la contraseña `postgres`, existe un método temporal (hacer backup de `pg_hba.conf`, permitir `trust` en localhost, crear la DB/usuario y restaurar el archivo). Pide que lo haga por ti y lo ejecuto.

6) Ejecutar migraciones

```powershell
& .\ven\Scripts\python.exe manage.py migrate
```

7) **Crear Administrador Global (Superusuario)**

⚠️ **IMPORTANTE**: El administrador global tiene acceso TOTAL al sistema. Usar solo para emergencias.

```powershell
& .\ven\Scripts\python.exe manage.py crear_superusuario_global --username admin_global --email admin@nuam.cl --password TuPasswordSegura123!
```

O usando variable de entorno:

```powershell
$env:ADMIN_PASSWORD="TuPasswordSegura123!"
& .\ven\Scripts\python.exe manage.py crear_superusuario_global
```

**Funciones del Administrador Global:**
- Acceso completo a Django Admin (`/admin/`)
- Panel de emergencia en frontend (`/admin-global`)
- Resetear contraseñas de usuarios
- Bloquear/desbloquear cuentas
- Ver auditoría completa del sistema
- Purgar datos (operación crítica)
- Todas sus acciones quedan auditadas con rol SUPERADMIN

8) Crear usuarios de prueba (opcional)

```powershell
& .\ven\Scripts\python.exe manage.py cargar_datos_iniciales
```

9) Arrancar el servidor

```powershell
& .\ven\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

Abrir en navegador: http://127.0.0.1:8000/

8) Solución de problemas rápidos

- "could not translate host name '127.0.0.1 '" → revisar `.env` y quitar espacios finales.
- UnicodeDecodeError (psycopg2) → asegurarse de tener `PGCLIENTENCODING=UTF8` en `.env` y comprobar `server_encoding`:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -h 127.0.0.1 -U postgres -c "SHOW server_encoding;"
```

Si la DB no está en UTF8, lo más sencillo es crear una base nueva con ENCODING='UTF8' para desarrollo o realizar un dump/restore con conversión.


#### 2. Frontend (React)

```bash
# Navegar al directorio frontend
cd FrontEnd

# Instalar dependencias desde package.json
npm install

# Iniciar servidor de desarrollo
npm run dev
# Servidor disponible en: http://localhost:5174 (o el puerto que Vite asigne)

# Scripts disponibles
npm run build    # Compilar para producción
npm run lint     # Ejecutar ESLint
npm run preview  # Ver build en local
```

---

## Módulos y Librerías Instalados

### Instalación Rápida

```bash
# Backend
cd Backend
pip install -r requirements.txt

# Frontend
cd FrontEnd
npm install
```

### Backend - **Requeridas para el Proyecto**
```bash
pip install -r requirements.txt
```

| Librería | Versión | Propósito |
|----------|---------|----------|
| Django | 5.2.6 | Framework web principal |
| djangorestframework | 3.16.1 | API REST |
| django-cors-headers | 4.9.0 | Soporte CORS para React |
| djangorestframework-simplejwt | 5.5.1 | Autenticación JWT |
| python-dotenv | 1.2.1 | Variables de entorno (.env) |
| psycopg2-binary | 2.9.11 | Conector PostgreSQL |

### Backend - Dependencias Automáticas (instaladas por pip)
- `asgiref` - Soporte async para Django
- `sqlparse` - Parsing de SQL
- `tzdata` - Información de zonas horarias
- `PyJWT` - Librería JWT (requerida por simplejwt)
- `pycparser` - Parser de C (para cffi)
- `cffi` - Interfaz C Foreign Function

### Backend - Librerías NO Utilizadas (pueden desinstalarse)
```bash
pip uninstall argon2-cffi argon2-cffi-bindings mysqlclient openpyxl pytube -y
```

| Librería | Por qué está | Estado |
|----------|--------------|--------|
| argon2-cffi | Hasher de contraseñas (no usado) | No necesaria |
| mysqlclient | Conector MySQL (usamos PostgreSQL) | No necesaria |
| openpyxl | Manejo de Excel (no implementado) | No necesaria |
| pytube | Descarga de YouTube (no usado) | No necesaria |

### Frontend - Dependencias Principales

```bash
npm install
```

| Librería | Versión | Propósito |
|----------|---------|----------|
| react | ^19.2.0 | Librería UI principal |
| react-dom | ^19.2.0 | Renderizado en DOM |
| react-router-dom | ^7.10.0 | Enrutamiento SPA |
| recharts | ^3.5.1 | Gráficos y visualización |
| axios | ^1.7.9 | Cliente HTTP para llamadas API |

### Frontend - Dependencias de Desarrollo

| Librería | Versión | Propósito |
|----------|---------|----------|
| vite | ^7.2.4 | Bundler y dev server |
| @vitejs/plugin-react | ^5.1.1 | Plugin React para Vite |
| eslint | ^9.39.1 | Linter de código |
| eslint-plugin-react-hooks | ^7.0.1 | Reglas eslint para React |
| eslint-plugin-react-refresh | ^0.4.24 | Soporte Fast Refresh |
| @types/react | ^19.2.5 | Tipos TypeScript para React |
| @types/react-dom | ^19.2.3 | Tipos TypeScript para React DOM |
| babel-plugin-react-compiler | ^1.0.0 | Compilador React optimizado |
| tailwindcss | ^3.4.1 | Framework CSS utilitario |
| postcss | ^8.5.6 | Procesador CSS |
| autoprefixer | ^10.4.22 | Prefijos CSS automáticos |

### Frontend - Scripts NPM

```bash
npm run dev      # Iniciar servidor de desarrollo (http://localhost:5174)
npm run build    # Compilar para producción (dist/)
npm run lint     # Ejecutar ESLint
npm run preview  # Previsualizar build en local
```

---

## Configuración de Seguridad

### Variables de Entorno (.env)

NUNCA commitear `Backend/.env` - Está en `.gitignore`

Para configurar el proyecto localmente:

```bash
# Copiar el archivo de ejemplo
cp Backend/.env.example Backend/.env

# Editar Backend/.env con tus credenciales
# Nota: NO subir este archivo a Git
```

**Backend/.env.example** (plantilla sin credenciales)
```env
SECRET_KEY=
DEBUG=False
DB_NAME=
USER=
PASSWORD=
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Instrucciones para completar .env:**
- `SECRET_KEY` - Generar una clave segura
- `DEBUG` - `False` en producción, `True` en desarrollo
- `DB_NAME` - Nombre de la BD PostgreSQL
- `USER` - Usuario de PostgreSQL
- `PASSWORD` - Contraseña de PostgreSQL
- `DB_HOST` - Host de PostgreSQL (localhost en desarrollo)
- `DB_PORT` - Puerto PostgreSQL (5432 por defecto)
- `ALLOWED_HOSTS` - Hosts permitidos
- `CORS_ALLOWED_ORIGINS` - Orígenes CORS permitidos

Seguridad:
- `.env` está en `.gitignore` (NO se commitea)
- `.env.example` SÍ se commitea (sin credenciales)
- Credenciales de BD en `.env` (variables de entorno)
- `SECRET_KEY` en `.env` (seguro)
- CORS restringido a localhost en desarrollo

---

## Sistema de Roles y Permisos (Implementar despues)

### Roles Implementados

#### 1. Corredor de Inversión
- Cargar certificados (PDF, CSV)
- Consultar estado de calificaciones
- Buscar registros de sus clientes
- Descargar reportes
- No puede editar calificaciones

#### 2. Analista Tributario
- Buscar registros (RUT, período, tipo)
- Editar calificaciones
- Validar y corregir errores
- Procesar datos OCR
- No puede aprobar auditorías

#### 3. Auditor Interno
- Buscar cualquier registro
- Revisar historial completo
- Generar reportes de auditoría
- Verificar cambios y trazabilidad
- No puede modificar registros

#### 4. Administrador TI

**Rol funcional:** Responsable de la administración técnica y operativa del sistema.

**Funciones principales:**
- Gestionar usuarios y asignar roles (✅ CRUD completo)
- Crear, editar y administrar reglas de negocio (✅ CRUD completo)
- Configurar parámetros del sistema
- Supervisar el funcionamiento general
- No puede acceder a datos tributarios sin auditoría

**Estado de implementación:**

✅ **Completado:**
- Gestión completa de usuarios (crear, editar, eliminar, asignar roles)
- Gestión completa de reglas de negocio (CRUD con versionado básico)
- Acceso exclusivo a panel de administración (/system-settings)
- Seguridad aplicada por JWT y RBAC
- Interfaz frontend dedicada (Administración NUAM)
- Auto-incremento de versión al editar reglas

⏳ **Pendiente:**
- Versionado avanzado de reglas de negocio (historial completo)
- Historial de cambios de reglas con diff
- Activación automática de reglas en procesos de validación
- Auditoría específica sobre cambios de configuración del sistema
- Rollback de reglas a versiones anteriores

#### 5. Administrador Global (Superusuario)

**⚠️ ROL DE EMERGENCIA - USO RESTRINGIDO**

**Propósito:** Recuperación ante incidentes críticos y operaciones de contingencia del sistema.

**Funciones principales:**
- Acceso completo a Django Admin
- Resetear contraseñas de cualquier usuario
- Bloquear/desbloquear cuentas de usuario
- Supervisión de seguridad y auditoría completa
- Gestión de usuarios, roles y configuraciones críticas
- Purga de datos (operación extremadamente crítica)
- Bypass completo de RBAC

**Estado de implementación:**

✅ **Completado:**
- Comando de creación automática (`crear_superusuario_global`)
- Acceso total mediante `is_superuser` de Django
- Panel dedicado en frontend (`/admin-global`)
- Endpoints de operaciones críticas:
  - `/api/admin-global/estado/` - Dashboard del sistema
  - `/api/admin-global/reset-password/` - Reset de contraseñas
  - `/api/admin-global/bloquear-usuario/` - Bloqueo/desbloqueo
  - `/api/admin-global/auditoria/` - Auditoría completa
  - `/api/admin-global/purgar-datos/` - Purga de datos
- Auditoría especial con rol SUPERADMIN
- Separación clara del resto de roles
- Interfaz con advertencias visuales (rojo)

**Procedimientos de contingencia:**

1. **Creación del superusuario:**
   ```bash
   python manage.py crear_superusuario_global --password SecurePass123!
   ```

2. **Acceso de emergencia:**
   - Frontend: http://localhost:5174/admin-global
   - Django Admin: http://127.0.0.1:8000/admin/

3. **Reset de contraseña de usuario bloqueado:**
   - Acceder a panel Admin Global
   - Tab "Operaciones Críticas"
   - Usar botón "Resetear contraseña"
   - Proporcionar ID del usuario y nueva contraseña
   - Acción queda auditada

4. **Bloqueo de cuenta comprometida:**
   - Acceder a panel Admin Global
   - Tab "Operaciones Críticas"
   - Usar botón "Bloquear usuario"
   - Proporcionar motivo del bloqueo
   - Usuario no podrá iniciar sesión

5. **Auditoría de incidentes:**
   - Tab "Auditoría Global"
   - Filtrar por usuario, acción, modelo
   - Revisar últimas 24h/7días/30días
   - Todas las acciones del superusuario quedan registradas

**⚠️ Restricciones de uso:**
- Solo para emergencias y contingencias
- Cambiar contraseña inmediatamente tras creación
- No usar para operaciones rutinarias
- Documentar cada uso en bitácora externa
- Todas las acciones quedan auditadas permanentemente

---

## Procedimientos de Contingencia

### Escenario 1: Usuario Admin TI bloqueado

**Síntomas:** El administrador TI no puede iniciar sesión.

**Solución:**
1. Acceder con Administrador Global
2. Navegar a `/admin-global` → "Operaciones Críticas"
3. Usar "Desbloquear usuario" con el ID del Admin TI
4. Verificar en auditoría la causa del bloqueo

**Comando alternativo:**
```bash
python manage.py shell
from django.contrib.auth.models import User
user = User.objects.get(username='ti_admin')
user.is_active = True
user.save()
```

### Escenario 2: Contraseña olvidada por usuario crítico

**Síntomas:** Usuario con rol importante no puede acceder.

**Solución:**
1. Verificar identidad del usuario fuera del sistema
2. Acceder con Administrador Global a `/admin-global`
3. Tab "Operaciones Críticas" → "Resetear contraseña"
4. Proporcionar ID del usuario y contraseña temporal
5. Informar al usuario la contraseña temporal
6. Usuario debe cambiarla en primer acceso

### Escenario 3: Actividad sospechosa detectada

**Síntomas:** Auditoría muestra acciones inusuales.

**Solución:**
1. Acceder con Administrador Global
2. Tab "Auditoría Global" → Filtrar por usuario sospechoso
3. Revisar todas las acciones recientes
4. Si se confirma compromiso: Tab "Operaciones Críticas" → "Bloquear usuario"
5. Resetear contraseña del usuario afectado
6. Documentar incidente en sistema externo

### Escenario 4: Purga de auditoría (mantenimiento)

**Síntomas:** Base de datos creciendo excesivamente.

**⚠️ OPERACIÓN CRÍTICA - Solo con autorización**

**Solución:**
1. Hacer backup completo de la base de datos
2. Acceder con Administrador Global
3. Usar endpoint `/api/admin-global/purgar-datos/`
4. Confirmar con texto exacto: `PURGAR_DEFINITIVAMENTE`
5. Especificar días a mantener (ej: 90)
6. Verificar logs tras purga

### Escenario 5: Pérdida de acceso de todos los administradores

**Síntomas:** Ningún administrador puede acceder al sistema.

**Solución de emergencia:**
```bash
# Acceder al servidor backend
cd Backend
.\ven\Scripts\Activate.ps1

# Crear nuevo superusuario de emergencia
python manage.py crear_superusuario_global --username emergencia --password EmergPass2025!

# Acceder con nuevas credenciales a /admin-global
# Revisar auditoría para identificar causa
# Restaurar accesos normales
```

---

## Autenticación JWT

### Flujo de Login
1. Usuario envía credenciales (username/password)
2. Backend valida y genera JWT token
3. Frontend almacena token en localStorage
4. Token se envía en headers de requests: `Authorization: Bearer {token}`
5. Backend valida token en cada petición

### Tokens
- Access Token: 60 minutos de validez
- Refresh Token: 1 día de validez
- Renovación automática de tokens

---

## Estructura del Proyecto

```
Ev3-Pi/
├── Backend/
│   ├── Django/
│   │   ├── settings.py (Configuración con dotenv)
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── src/
│   │   ├── models.py (Registros, PerfilUsuario, ReglaNegocio)
│   │   ├── views.py (ViewSets y endpoints)
│   │   ├── views/ (Vistas organizadas por módulo)
│   │   │   ├── auth.py (Autenticación)
│   │   │   ├── registros.py (Gestión registros)
│   │   │   ├── usuarios.py (CRUD usuarios)
│   │   │   ├── reglas_negocio.py (CRUD reglas)
│   │   │   └── auditoria.py (Auditoría)
│   │   ├── serializers.py (Serialización JSON)
│   │   ├── permissions.py (Control de permisos)
│   │   └── admin.py
│   ├── migrations/
│   ├── manage.py
│   ├── .env (credenciales PostgreSQL)
│   └── venv/ (entorno virtual)
│
├── FrontEnd/
│   ├── src/
│   │   ├── App.jsx (Contextos y rutas)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx (Nav con active routing)
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── common/
│   │   │   │   ├── ThemeToggle.jsx (Light/Dark mode)
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── button.jsx
│   │   │   │   └── input.jsx
│   │   │   └── auth/
│   │   │       └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CertificatesUpload.jsx (Centrado)
│   │   │   ├── TaxManagement.jsx (Centrado)
│   │   │   ├── AuditPanel.jsx (Centrado)
│   │   │   ├── Registros.jsx (Búsqueda)
│   │   │   ├── AdministracionNuam.jsx (Panel Admin TI)
│   │   │   └── NoAutorizado.jsx
│   │   └── hooks/
│   │       └── useForm.js
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Características Implementadas

### Backend
- Autenticación JWT con SimpleJWT
- Roles y permisos granulares
- Bypass de permisos para superusuarios
- API REST con Django REST Framework
- CORS configurado para desarrollo
- Migraciones automáticas
- Admin panel integrado
- **CRUD completo de Usuarios** (crear, editar, eliminar usuarios con roles)
- **CRUD completo de Reglas de Negocio** (versionado automático al editar)

### Frontend
- Sistema de autenticación con localStorage
- Rutas protegidas con ProtectedRoute
- Tema claro/oscuro (ThemeContext)
- Navbar con active route highlighting
- Búsqueda de registros tributarios
- Páginas centradas y responsive
- Modal reutilizable
- **Panel de Administración Nuam** (solo superusuarios)
  - Gestión de Usuarios con tabla interactiva
  - Gestión de Reglas de Negocio con tabla interactiva
  - Formularios de crear/editar integrados
  - Botones Edit/Delete en cada elemento

### Seguridad
- Variables sensibles en `.env`
- JWT para autenticación
- Permisos basados en roles
- Segregación de funciones
- `.env` en `.gitignore`

---

## Flujo de Búsqueda de Registros

La funcionalidad principal es la búsqueda de registros disponible para todos los roles operativos:

1. Usuario accede a "Registros"
2. Ingresa término de búsqueda
3. Selecciona filtro: Título, Descripción o Todos
4. Sistema filtra registros en tiempo real
5. Resultados mostrados con información completa

---

## Endpoints Disponibles

### Autenticación
- `POST /api/token/` - Login (username/password)
- `POST /api/token/refresh/` - Renovar token

### Registros
- `GET /api/registros/` - Listar registros
- `POST /api/registros/` - Crear registro
- `GET /api/registros/{id}/` - Obtener detalle
- `PUT /api/registros/{id}/` - Editar registro
- `DELETE /api/registros/{id}/` - Eliminar registro

### Usuarios (CRUD completo - Solo TI/Superusuarios)
- `GET /api/perfil/` - Obtener perfil del usuario actual
- `GET /api/usuarios/` - Listar todos los usuarios
- `POST /api/usuarios/` - Crear nuevo usuario con rol
- `GET /api/usuarios/{id}/` - Obtener detalle de usuario
- `PUT /api/usuarios/{id}/` - Actualizar usuario y rol
- `DELETE /api/usuarios/{id}/` - Eliminar usuario

### Reglas de Negocio (CRUD completo - Solo TI/Superusuarios)
- `GET /api/reglas-negocio/` - Listar todas las reglas
- `POST /api/reglas-negocio/` - Crear nueva regla
- `GET /api/reglas-negocio/{id}/` - Obtener detalle de regla
- `PUT /api/reglas-negocio/{id}/` - Actualizar regla (auto-incrementa versión)
- `DELETE /api/reglas-negocio/{id}/` - Eliminar regla
- `GET /api/reglas-negocio/{id}/historial/` - Ver historial de versiones
- `POST /api/reglas-negocio/{id}/rollback/` - Restaurar versión anterior
- `GET /api/reglas-negocio/{id}/comparar/?v1=X&v2=Y` - Comparar dos versiones

### Admin Global (Solo Superusuarios - Emergencias)
- `GET /api/admin-global/estado/` - Dashboard con métricas del sistema
- `POST /api/admin-global/reset-password/` - Resetear contraseña de usuario
- `POST /api/admin-global/bloquear-usuario/` - Bloquear/desbloquear cuenta
- `GET /api/admin-global/auditoria/` - Auditoría completa con filtros
- `POST /api/admin-global/purgar-datos/` - Purga masiva de datos (CRÍTICO)

---

## Desarrollo

### Agregar Nueva Página
1. Crear componente en `FrontEnd/src/pages/`
2. Importar `ThemeContext` para estilos
3. Usar `useLocation` para active routing
4. Agregar ruta en `FrontEnd/src/router.jsx`

### Agregar Nuevo Modelo
1. Definir en `Backend/src/models.py`
2. Crear serializer en `Backend/src/serializers.py`
3. Crear viewset en `Backend/src/views.py`
4. Registrar en `Backend/src/admin.py`
5. Ejecutar: `python manage.py makemigrations && python manage.py migrate`

---

## Notas Importantes

- PostgreSQL debe estar corriendo localmente
- Credenciales de BD en `Backend/.env`
- Frontend se conecta a `http://127.0.0.1:8000`
- Tokens JWT se almacenan en localStorage
- Superusuarios bypasean todas las restricciones de rol

---

## Soporte

Para más información, revisar la documentación de:
- Django: https://docs.djangoproject.com/
- React: https://react.dev/
- JWT: https://jwt.io/

---

**Última actualización**: 14 de diciembre de 2025

## Cambios Recientes (14/12/2025)

### Backend - MongoDB & Django
- ✅ **Corrección de errores MongoDB Authentication**
  - Implementado manejo de `OperationFailure` en [Backend/src/mongodb_utils.py](Backend/src/mongodb_utils.py)
  - Fallback automático a conexión sin credenciales para localhost
  - Validación con `ping()` para detectar errores de autenticación anticipadamente
  - Soluciona 500 errors al crear índices en MongoDB

- ✅ **Corrección de rutas conflictivas en Django**
  - Reordenadas rutas en [Backend/Django/urls.py](Backend/Django/urls.py)
  - Ruta `/calificaciones-corredor/estadisticas/` ahora procesada ANTES de `<str:calificacion_id>`
  - Evita que "estadisticas" sea interpretado como ID inválido (error 400)

### Frontend - Tailwind CSS & Modo Oscuro
- ✅ **Instalación de Tailwind CSS v3.4.1**
  - Configurado [FrontEnd/tailwind.config.js](FrontEnd/tailwind.config.js) con `darkMode: 'class'`
  - Configurado [FrontEnd/postcss.config.js](FrontEnd/postcss.config.js)
  - Actualizado [FrontEnd/src/index.css](FrontEnd/src/index.css) con directivas Tailwind

- ✅ **Sistema de Modo Oscuro Funcional**
  - Actualizado [App.jsx](FrontEnd/src/App.jsx) para aplicar clase `dark` al HTML
  - Sincronización de tema con localStorage
  - Componentes responden automáticamente al cambio de tema

- ✅ **Estilización de Páginas Principales**
  - [CorredorDashboard.jsx](FrontEnd/src/pages/CorredorDashboard.jsx)
    - Header con botón refrescar y subir certificado
    - Tarjetas de estadísticas con gradientes en dark mode
    - Filtros temáticos y tabla de certificados
    - Badges de estado con paleta oscura
    - Soporte completo para modo oscuro

  - [CertificatesUpload.jsx](FrontEnd/src/pages/CertificatesUpload.jsx)
    - 4 modos de carga: Manual, PDF, CSV, Excel
    - Inputs de archivo con validaciones específicas
    - Botones de modo con estados visuales
    - Estilos responsive con modo oscuro

  - [Registros.jsx](FrontEnd/src/pages/Registros.jsx)
    - Conversión completa a Tailwind CSS
    - Tarjetas de registros con hover effects
    - Botones de acción (editar, eliminar, crear, enviar)
    - Badges de estado con colores temáticos
    - Estado de carga con spinner

  - [AuditPanel.jsx](FrontEnd/src/pages/AuditPanel.jsx)
    - Tabla de validación con estilos oscuros
    - Header descriptivo con botón refrescar
    - Badges de estado para calificaciones
    - Estado vacío con ícono
    - Manejo visual de errores

### Características Implementadas
✅ Modo oscuro funcional en todas las páginas principales  
✅ Degradados y sombras adaptadas al tema  
✅ Badges de estado con paleta coherente  
✅ Hover effects y transiciones suaves  
✅ Manejo de estados de carga y error  
✅ Resolución completa de conflictos de rutas Django  
✅ Solución de autenticación MongoDB para localhost  
✅ Framework CSS completo con Tailwind v3

### Cambios Recientes (13/12/2025)

### Backend
- ✅ Implementado CRUD completo para **Usuarios** (`/api/usuarios/`)
- ✅ Implementado CRUD completo para **Reglas de Negocio** (`/api/reglas-negocio/`)

### Frontend
- ✅ Implementado panel **Administración Nuam**

---
📅 Resumen de Avances – 14 de diciembre de 2025



1. Conexión y validación de MongoDB

Se verificó correctamente la conexión con MongoDB Compass.

Se confirmó la lectura y escritura de calificaciones desde MongoDB.

Se validó que las colecciones se crean y consultan correctamente.

2. Implementación de dashboards por rol (RBAC)

Se dejó funcionando la separación correcta de vistas por rol, cumpliendo RBAC:

/dashboard/corredor

/dashboard/analista

/dashboard/auditor

/dashboard/admin-ti

se validó que:

Un analista no puede entrar al dashboard de corredor

Un auditor no puede acceder a vistas no autorizadas

El bloqueo muestra “No autorizado” correctamente

3.Dashboard Corredor (funcional)

Visualización de certificados propios

Estados visibles: BORRADOR, PENDIENTE, OBSERVADA, APROBADA

Estadísticas:

Total de certificados

Conteo por estado

Filtros por:

Estado

Período

Tipo de certificado

Navegación a detalle del certificado


4. Dashboard Analista (funcional)

Visualización de todas las calificaciones

Cambio de estado:

BORRADOR → PENDIENTE

Aplicación de filtros

Validación del flujo correcto antes de pasar a auditoría

5. Dashboard Auditor (funcional)

Visualización de calificaciones en estado PENDIENTE

Resolución de calificaciones:

APROBADA

RECHAZADA

OBSERVADA

Registro de observaciones/comentarios


6. Flujo completo de estados validado

Se comprobó el flujo real del sistema:

Corredor crea certificado → BORRADOR

Analista revisa → PENDIENTE

Auditor:

Aprueba → APROBADA

Rechaza → RECHAZADA

Observa → OBSERVADA

Corredor visualiza observación

El flujo funciona correctamente a nivel de lógica y permisos.

7. Vista Detalle de Calificación

Se implementó DetalleCalificacion.jsx

Se logró:

Ver detalle completo del certificado

Mostrar comentario del auditor

Mostrar estado actual


8.Router y protección de rutas (Frontend)

Se configuró correctamente router.jsx

Uso de ProtectedRoute por rol

Layout común con Navbar y Footer

Rutas protegidas correctamente por permisos

---

## Actualización 15/12/2025 - Perfil Completo + MFA

### 🎯 Sistema de Perfil de Usuario Completo

#### 1. Modelos Extendidos

**PerfilUsuario (ampliado)**
- `foto_perfil`: ImageField para subida de foto (upload_to="perfiles/%Y/%m/")
- `biografia`: TextField para descripción personal
- `telefono`: CharField(20) para contacto
- `mfa_habilitado`: Boolean para MFA
- `mfa_secret`: CharField(32) para TOTP secret (pyotp)
- `cambio_rol_solicitado`: Boolean (solo 1 vez por usuario)

**CorreoAdicional (nuevo modelo)**
- `usuario`: FK a User
- `email`: EmailField único per usuario
- `verificado`: Boolean (para validación futura)
- `principal`: Boolean (para marcar email principal)
- `fecha_agregado`: DateTimeField
- Meta: unique_together['usuario', 'email'], ordering por principal + fecha

**SolicitudCambioRol (nuevo modelo)**
- `usuario`: FK a User
- `rol_actual`: CharField (guardado para historial)
- `rol_solicitado`: CharField con choices
- `justificacion`: TextField (mínimo 50 caracteres requeridos)
- `estado`: PENDIENTE | APROBADA | RECHAZADA
- `fecha_solicitud`, `fecha_respuesta`: DateTimeField
- `respondido_por`: FK a User (admin que aprueba/rechaza)
- `comentario_admin`: TextField (motivo de rechazo)
- Meta: ordering por -fecha_solicitud

#### 2. Vistas API Backend

Archivo: `Backend/src/views/perfil_completo.py`

**PerfilUsuarioView (GET/PUT)**
- GET: Obtener perfil completo con correos, estado MFA, solicitudes
- PUT: Actualizar nombre, apellido, biografía, teléfono, foto (multipart/form-data)
- Validación: foto máximo 5MB
- Auto-auditoría de cambios

**CorreoAdicionalView (GET/POST/DELETE)**
- GET: Listar correos adicionales
- POST: Agregar nuevo correo (validación de duplicados)
- DELETE: Eliminar (no permite eliminar principal)
- Auto-auditoría

**SolicitudCambioRolView (GET/POST)**
- GET: Ver solicitud actual e historial
- POST: Crear solicitud (solo 1 vez por usuario)
- Validación: justificación mínimo 50 caracteres
- Bloquea si rol_solicitado == rol_actual
- Marca flag `cambio_rol_solicitado = True` después de primera solicitud

**MFAConfigView (GET/POST/PUT/DELETE)**
- GET: Ver estado MFA
- POST: Generar secret + código QR (base64)
- PUT: Verificar código e INSIMPLIFICAR MFA
- DELETE: Deshabilitar MFA (requiere código válido)
- Usa `pyotp.TOTP` con valid_window=1 (30 segundos)
- Retorna QR code en base64 para renderear en frontend

**GestionSolicitudesRolView (GET/PATCH)**
- Solo TI/ADMIN
- GET: Listar solicitudes por estado
- PATCH: Aprobar/rechazar solicitud (solo PENDIENTE)
- Al APROBAR: actualiza rol en PerfilUsuario
- Auto-auditoría con acción RESOLUCION
- Metadata con rol_anterior y rol_nuevo

#### 3. Rutas API
```
GET    /api/perfil-completo/                  # Ver perfil
PUT    /api/perfil-completo/                  # Editar perfil

GET    /api/correos-adicionales/              # Listar correos
POST   /api/correos-adicionales/              # Agregar correo
DELETE /api/correos-adicionales/              # Eliminar correo

GET    /api/solicitud-cambio-rol/             # Ver solicitud
POST   /api/solicitud-cambio-rol/             # Crear solicitud

GET    /api/mfa-config/                       # Estado MFA
POST   /api/mfa-config/                       # Generar QR
PUT    /api/mfa-config/                       # Activar MFA
DELETE /api/mfa-config/                       # Deshabilitar MFA

GET    /api/admin/solicitudes-rol/            # Listar (TI/ADMIN)
PATCH  /api/admin/solicitudes-rol/<id>/       # Aprobar/rechazar
```

#### 4. Página de Perfil Frontend

Archivo: `FrontEnd/src/pages/Perfil.jsx`

**Tabs:**
1. **📋 Información**
   - Mostrar: email, teléfono, biografía
   - Botón "Editar" → modo edición inline
   - Subida de foto con preview
   - Validación cliente (5MB max)

2. **📧 Correos Adicionales**
   - Lista de correos con estado (verificado/pendiente, principal)
   - Input para agregar nuevo correo
   - Botón 🗑️ para eliminar (no principal)
   - Validación duplicados

3. **🔐 MFA (Autenticación Multi-Factor)**
   - Estado: habilitado/deshabilitado
   - Si deshabilitado:
     * Botón "Habilitar" → generar QR
     * Mostrar QR + secret
     * Input de 6 dígitos para verificar
     * Botón "Verificar y Activar"
   - Si habilitado:
     * Mostrar ✅ MFA Habilitado
     * Botón rojo "Deshabilitar" (requiere código)

4. **🔄 Cambio de Rol**
   - Warning: ⚠️ Solo puedes solicitar 1 vez
   - Estados:
     * Si ya solicitó: mostrar solicitud pendiente con estado
     * Si rechazada: mostrar comentario admin
     * Si puede solicitar:
       - Select de roles (excepto rol actual)
       - Textarea justificación (min 50 chars)
       - Contador de caracteres
       - Botón "Enviar" (disabled si < 50 chars)
   - Mostrar historial de solicitudes

**Header con foto**:
- Avatar circular con borde azul
- Botón 📷 para cambiar foto (solo en modo edición)

#### 5. Navbar Modificado

Archivo: `FrontEnd/src/components/layout/Navbar.jsx`

**Cambios:**
- Quitar "Mi Perfil" de nav links principales
- Mostrar solo nombre de usuario: `👤 {username} ▼`
- Dropdown al hacer click:
  * ⚙️ Configuración de Perfil → link a /perfil
  * 👤 Mi Perfil → link a /perfil
  * 🚪 Cerrar Sesión → logout()
- Dropdown cierra al hacer click en opción
- Estilos: hover effect en items

#### 6. Dependencias Agregadas

Instaladas en Backend:
- `pyotp==2.9.0`: TOTP para MFA
- `qrcode==8.0`: Generación de códigos QR
- `Pillow==11.1.0`: Procesamiento de imágenes (foto perfil)

#### 7. Migraciones

`0012_perfilusuario_biografia_and_more.py`:
- Agrega 6 campos a PerfilUsuario
- Crea modelo CorreoAdicional
- Crea modelo SolicitudCambioRol

---

## Actualización 15/12/2025 (Primera Parte)

### 🎯 Módulo de Certificados Digitales Completo

#### 1. Modelo Certificado (PostgreSQL)
- **Campos**: tipo (AFP, APV, ISAPRE, etc), archivo (FileField), nombre_archivo, tamaño_bytes, mime_type
- **Estados**: CARGADO → VALIDADO/RECHAZADO
- **Relaciones**: FK a Registro, Calificacion (nullable), User (cargado_por, validado_por)
- **Metadatos**: JSONField para datos extraídos por OCR
- **Índices**: Optimización en tipo+estado, registro+tipo

#### 2. Vistas de Upload y Gestión
Archivo: `Backend/src/views/certificados_upload.py`

**CertificadoUploadView (POST)**
- Multipart/form-data con validación de tamaño (max 10MB)
- Formatos: PDF, CSV, Excel (.xls, .xlsx)
- Validación de MIME type vs extensión
- Permisos: Corredor solo sube a sus registros
- Auto-auditoría de carga

**CertificadoListView (GET)**
- Filtros: registro_id, tipo, estado
- Corredor solo ve sus certificados
- Serialización completa con URLs

**CertificadoDetailView (GET/PATCH/DELETE)**
- GET: Detalle completo con metadatos
- PATCH: Validar/rechazar (solo ANALISTA/AUDITOR/TI)
- DELETE: Solo creador o TI
- Auto-auditoría de cambios

#### 3. Configuración Django Storage
- **MEDIA_ROOT**: `Backend/media/`
- **MEDIA_URL**: `/media/`
- Upload path: `certificados/%Y/%m/` (organizados por fecha)
- Servido en desarrollo con `static()`

#### 4. Rutas API
```
POST   /api/certificados-upload/          # Subir certificado
GET    /api/certificados-list/            # Listar con filtros
GET    /api/certificados-detail/<id>/     # Ver detalle
PATCH  /api/certificados-detail/<id>/     # Validar/rechazar
DELETE /api/certificados-detail/<id>/     # Eliminar
```

#### 5. Migraciones
- `0011_certificado_alter_auditoria_options_and_more.py`
- Índices DB para queries eficientes

---

### 📊 Sistema de Auditoría Mejorado

#### 1. Modelo Auditoria Ampliado
**Nuevas acciones**:
- `ESTADO_CAMBIO`: Cambios de estado en Calificacion
- `RESOLUCION`: Decisiones de auditor (aprobar/rechazar/observar)
- `LOGOUT`: Cierre de sesión

**Nuevos campos**:
- `ip_address`: CharField(100) para tracking de IP
- `metadatos`: JSONField para contexto adicional (estado_anterior, estado_nuevo, etc)

**Meta**:
- Índices en (usuario, fecha) y (accion, modelo)
- Ordering por -fecha

#### 2. Vista de Auditoría con Filtros
Archivo: `Backend/src/views/auditoria.py`

**AuditoriaView (GET)**
- **Filtros**: fecha_desde, fecha_hasta, usuario, accion, modelo, objeto_id, rol
- **Paginación**: page, page_size (default 50, max 200)
- **Default**: Últimos 30 días
- **Permisos**: Solo AUDITOR/TI/ADMIN
- **Respuesta**: Total, páginas, resultados con relaciones cargadas

**AuditoriaEstadisticasView (GET)**
- Totales por acción, modelo, rol
- Top 10 usuarios más activos
- Periodo: últimos 30 días

#### 3. Auto-auditoría de Cambios de Estado
Archivo: `Backend/src/signals.py`

**Mecanismo**:
- `pre_save`: Captura estado anterior en thread local
- `post_save`: Detecta cambio y crea registro ESTADO_CAMBIO
- **Metadatos**: { estado_anterior, estado_nuevo }
- Automático para Calificacion

#### 4. Rutas API
```
GET /api/auditoria/                    # Lista con filtros
GET /api/auditoria/estadisticas/       # Estadísticas 30 días
```

---

### 🔧 Mejoras de Infraestructura

1. **Django FileField Storage**: MEDIA_ROOT configurado para producción
2. **URL Routing**: Orden correcto (estadisticas antes de <id>)
3. **Signals**: Auto-tracking de cambios de estado
4. **Indexes DB**: Optimización de queries en Certificado y Auditoria
5. **Thread Safety**: Estado anterior capturado con threading.local

---

### ⚠️ Pendiente (Backlog Próximo)

**Alta Prioridad**:
1. **JWT Refresh + MFA**: Implementar refresh token rotation y autenticación multifactor
2. **PUT/PATCH Corredor**: Permitir correcciones en calificaciones OBSERVADA → BORRADOR
3. **Frontend Certificados**: Página de upload con drag-drop y preview

**Media Prioridad**:
4. **RBAC Documentación**: Matriz formal de permisos + diagrama UML
5. **Calificaciones Model**: Ajustes finales de campos y validaciones
6. **Reglas de Negocio**: Auto-ejecución en cambio de estado

**Baja Prioridad**:
7. **Registro Público**: Frontend para usuarios sin cuenta
8. **Pruebas Unitarias**: Coverage 80%+ en vistas críticas
9. **CI/CD**: GitHub Actions + Docker

---
