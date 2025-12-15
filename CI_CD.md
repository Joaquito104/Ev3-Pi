# Guía de CI/CD

## Archivos Creados

### 📁 Workflows de GitHub Actions
- `.github/workflows/ci.yml` - Pipeline de integración continua
- `.github/workflows/deploy.yml` - Pipeline de despliegue

### 🐳 Docker
- `Dockerfile.backend` - Imagen de Django con gunicorn
- `Dockerfile.frontend` - Imagen de React con nginx
- `docker-compose.yml` - Orquestación de servicios
- `nginx.conf` - Configuración de nginx para SPA
- `.dockerignore` - Archivos excluidos de builds
- `.env.docker` - Template de variables para Docker

### 🧪 Testing
- `Backend/pytest.ini` - Configuración de pytest
- `Backend/src/tests.py` - Tests de ejemplo

## Uso Rápido

### Desarrollo Local con Docker

```bash
# 1. Copiar variables de entorno
cp .env.docker .env

# 2. Editar .env con tus valores
nano .env

# 3. Levantar servicios
docker-compose up -d

# 4. Ver logs
docker-compose logs -f

# 5. Aplicar migraciones
docker-compose exec backend python manage.py migrate

# 6. Crear superusuario
docker-compose exec backend python manage.py crear_superusuario_global
```

**Acceder:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MongoDB: localhost:27017

### Testing Local

```bash
# Backend
cd Backend
pip install pytest pytest-django coverage bandit
pytest
coverage run -m pytest && coverage report

# Frontend
cd FrontEnd
npm run lint
npm run build
npm audit
```

## CI/CD en GitHub

### Configurar Secrets

Ve a Settings > Secrets and variables > Actions y añade:

**Para Docker Hub:**
- `DOCKER_USERNAME` - Tu usuario de Docker Hub
- `DOCKER_PASSWORD` - Token de acceso (no contraseña)

**Para Deploy Staging:**
- `STAGING_SSH_KEY` - Clave privada SSH (formato PEM)
- `STAGING_USER` - Usuario SSH (ej: ubuntu)
- `STAGING_HOST` - IP o dominio del servidor

**Para Deploy Production:**
- `PRODUCTION_SSH_KEY`
- `PRODUCTION_USER`
- `PRODUCTION_HOST`

### Cómo Funciona

**CI Pipeline (automático en push/PR):**
1. Backend: lint → tests → seguridad → cobertura
2. Frontend: lint → build → auditoría
3. Docker: build → push a Docker Hub (solo en push a main/develop)

**CD Pipeline:**
- **Staging**: Auto-deploy en push a `main`
- **Production**: Manual (Actions > CD Pipeline > Run workflow)

### Deploy Manual a Producción

1. Ir a GitHub Actions
2. Seleccionar "CD Pipeline"
3. Click "Run workflow"
4. Elegir "production"
5. Confirmar

El pipeline hará:
- Backup de la BD antes de deploy
- Pull del código
- Update de contenedores
- Migraciones
- Health check
- Rollback automático si falla

## Estructura de Servicios Docker

```
┌─────────────────────────────────────────────┐
│              Docker Compose                 │
├─────────────────────────────────────────────┤
│  Frontend (nginx:alpine)                    │
│  ├─ Puerto 80                               │
│  ├─ SPA routing                             │
│  └─ Gzip compression                        │
├─────────────────────────────────────────────┤
│  Backend (python:3.11-slim)                 │
│  ├─ Puerto 8000                             │
│  ├─ Gunicorn (4 workers)                    │
│  └─ Django + DRF                            │
├─────────────────────────────────────────────┤
│  PostgreSQL 15                              │
│  ├─ Puerto 5432                             │
│  └─ Volume persistente                      │
├─────────────────────────────────────────────┤
│  Redis 7                                    │
│  ├─ Puerto 6379                             │
│  └─ Appendonly mode                         │
├─────────────────────────────────────────────┤
│  MongoDB 7 (opcional)                       │
│  ├─ Puerto 27017                            │
│  └─ Para auditoría avanzada                 │
└─────────────────────────────────────────────┘
```

## Comandos Docker Útiles

```bash
# Ver estado
docker-compose ps

# Logs en tiempo real
docker-compose logs -f [servicio]

# Entrar a un contenedor
docker-compose exec backend bash
docker-compose exec postgres psql -U admin gestion_db

# Reiniciar servicio
docker-compose restart backend

# Rebuild forzado
docker-compose up -d --build --force-recreate

# Limpiar todo
docker-compose down -v  # ⚠️ Borra volúmenes (BD)

# Backup de BD
docker-compose exec postgres pg_dump -U admin gestion_db > backup.sql

# Restaurar BD
docker-compose exec -T postgres psql -U admin gestion_db < backup.sql
```

## Troubleshooting

### Puerto en uso
```bash
# Ver qué usa el puerto
netstat -ano | findstr :8000

# Cambiar puerto en .env
BACKEND_PORT=8001
```

### Permisos en Linux
```bash
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

### Limpiar caché de Docker
```bash
docker system prune -a
docker volume prune
```

### Ver logs del workflow
1. GitHub > Actions
2. Click en el workflow fallido
3. Ver paso que falló

## Next Steps

1. Configurar dominio y SSL (Certbot)
2. Configurar variables de producción en servidor
3. Configurar backups automáticos
4. Monitoreo (Sentry, New Relic, etc.)
5. Configurar Slack/Discord para notificaciones
