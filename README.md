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

```bash
# Navegar al directorio backend
cd Backend

# Crear y activar entorno virtual
python -m venv venv
source venv/Scripts/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias desde requirements.txt
pip install -r requirements.txt

# Configurar variables de entorno
# Asegúrate de que Backend/.env existe con las credenciales de PostgreSQL

# Ejecutar migraciones
python manage.py migrate

# Iniciar servidor Django
python manage.py runserver
# Servidor disponible en: http://127.0.0.1:8000
```

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

## Sistema de Roles y Permisos

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
- Administrar usuarios
- Definir parámetros técnicos
- Gestionar roles y MFA
- Supervisar integraciones
- No puede acceder a datos tributarios

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
│   │   ├── models.py (Registros, PerfilUsuario)
│   │   ├── views.py (ViewSets y endpoints)
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
│   │   │   ├── SystemSettings.jsx (Centrado)
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

### Frontend
- Sistema de autenticación con localStorage
- Rutas protegidas con ProtectedRoute
- Tema claro/oscuro (ThemeContext)
- Navbar con active route highlighting
- Búsqueda de registros tributarios
- Páginas centradas y responsive
- Modal reutilizable

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

### Usuarios
- `GET /api/perfil/` - Obtener perfil del usuario actual
- `GET /api/usuarios/` - Listar usuarios (solo admin)

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

**Última actualización**: 6 de diciembre de 2025