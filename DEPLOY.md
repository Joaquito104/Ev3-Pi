# 🚀 Guía de Despliegue en Producción

## ⚠️ CHECKLIST PRE-PRODUCCIÓN

### 1. Seguridad Básica
- [ ] Cambiar `SECRET_KEY` por valor aleatorio de 50+ caracteres
- [ ] Establecer `DEBUG=False` en `.env`
- [ ] Configurar `ALLOWED_HOSTS` con dominios autorizados
- [ ] Cambiar credenciales de base de datos (admin/admin → contraseñas fuertes)
- [ ] Rotar todas las credenciales por defecto

### 2. HTTPS y Certificados
- [ ] Obtener certificado SSL/TLS (Let's Encrypt, Cloudflare, etc.)
- [ ] Configurar `SECURE_SSL_REDIRECT=True`
- [ ] Habilitar `SESSION_COOKIE_SECURE=True`
- [ ] Habilitar `CSRF_COOKIE_SECURE=True`
- [ ] Configurar HSTS: `SECURE_HSTS_SECONDS=31536000`

### 3. Rate Limiting
- [ ] Verificar que DRF throttling esté activo
- [ ] Ajustar tasas según carga esperada
- [ ] Monitorear logs de throttling

### 4. Base de Datos
- [ ] PostgreSQL en servidor dedicado o RDS
- [ ] Conexión SSL habilitada
- [ ] Backups automáticos configurados
- [ ] MongoDB con autenticación SCRAM-SHA-256
- [ ] TLS habilitado para MongoDB

### 5. MFA Obligatorio
- [ ] Forzar MFA para roles críticos (TI, Auditor)
- [ ] Documentar proceso de activación MFA

### 6. Logging y Monitoreo
- [ ] Configurar logs externos (CloudWatch, Papertrail, ELK)
- [ ] Alertas para eventos críticos
- [ ] Dashboard de métricas (Grafana, Datadog)

### 7. Validaciones
- [ ] Tests de seguridad (OWASP ZAP, Burp Suite)
- [ ] Penetration testing básico
- [ ] Validar todas las reglas de negocio

---

## 📝 CONFIGURACIÓN .env PRODUCCIÓN

```bash
# Copiar template
cp Backend/.env.example Backend/.env

# Editar con valores reales
nano Backend/.env
```

**Variables críticas a configurar:**
```
SECRET_KEY=<generar con get_random_secret_key()>
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
DB_USER=ev3pi_prod
PASSWORD=<contraseña fuerte 16+ chars>
MONGODB_PASSWORD=<contraseña fuerte>
EMAIL_HOST_PASSWORD=<app password de Gmail>
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

---

## 🔧 INSTALACIÓN EN SERVIDOR

### Opción 1: VPS tradicional (Ubuntu/Debian)

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar dependencias
sudo apt install python3.11 python3.11-venv python3-pip postgresql redis-server nginx -y

# 3. Instalar Argon2 (password hasher más seguro)
sudo apt install libargon2-dev -y
pip install argon2-cffi

# 4. Configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE ev3pi_production;
CREATE USER ev3pi_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE ev3pi_production TO ev3pi_user;
\q

# 5. Configurar Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 6. Clonar repositorio
git clone <repo-url> /var/www/ev3pi
cd /var/www/ev3pi

# 7. Crear entorno virtual
python3.11 -m venv .venv
source .venv/bin/activate

# 8. Instalar dependencias
pip install -r Backend/requirements.txt
pip install argon2-cffi gunicorn

# 9. Configurar .env
cp Backend/.env.example Backend/.env
nano Backend/.env  # Editar con valores producción

# 10. Migraciones
python Backend/manage.py migrate

# 11. Crear superusuario
python Backend/manage.py crear_superusuario_global

# 12. Recolectar archivos estáticos
python Backend/manage.py collectstatic --no-input

# 13. Configurar Gunicorn
sudo nano /etc/systemd/system/ev3pi.service
```

**Archivo ev3pi.service:**
```ini
[Unit]
Description=EV3-Pi Django Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/ev3pi/Backend
Environment="PATH=/var/www/ev3pi/.venv/bin"
ExecStart=/var/www/ev3pi/.venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/var/www/ev3pi/Backend/gunicorn.sock \
    Django.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar servicio
sudo systemctl enable ev3pi
sudo systemctl start ev3pi
```

### Opción 2: Docker

```dockerfile
# Backend/Dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Instalar dependencias sistema
RUN apt-update && apt-get install -y \
    libpq-dev \
    libargon2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt argon2-cffi gunicorn

# Copiar código
COPY . .

# Recolectar estáticos
RUN python manage.py collectstatic --no-input

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "Django.wsgi:application"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ev3pi_production
      POSTGRES_USER: ev3pi_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  backend:
    build: ./Backend
    environment:
      - DATABASE_URL=postgresql://ev3pi_user:${DB_PASSWORD}@db:5432/ev3pi_production
    depends_on:
      - db
      - redis
    volumes:
      - ./Backend/media:/app/media
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./Backend/static:/var/www/static
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

---

## 🔐 CONFIGURACIÓN NGINX

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req zone=login burst=10 nodelay;

    location / {
        proxy_pass http://unix:/var/www/ev3pi/Backend/gunicorn.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /static/ {
        alias /var/www/ev3pi/Backend/static/;
    }

    location /media/ {
        alias /var/www/ev3pi/Backend/media/;
    }
}
```

---

## 📊 MONITOREO POST-DEPLOY

### 1. Verificar que todo funciona
```bash
# Health check
curl https://tu-dominio.com/api/health/

# Login test
curl -X POST https://tu-dominio.com/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Monitorear logs
```bash
# Logs Django
tail -f /var/www/ev3pi/Backend/logs/security.log

# Logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs Gunicorn
journalctl -u ev3pi -f
```

### 3. Verificar SSL
```bash
# Test SSL config
curl -I https://tu-dominio.com
openssl s_client -connect tu-dominio.com:443

# Test con SSLLabs
https://www.ssllabs.com/ssltest/
```

---

## 🚨 TROUBLESHOOTING

### Error: 502 Bad Gateway
- Verificar que Gunicorn está corriendo: `sudo systemctl status ev3pi`
- Verificar permisos del socket: `ls -l /var/www/ev3pi/Backend/gunicorn.sock`
- Revisar logs: `journalctl -u ev3pi -n 50`

### Error: CORS blocked
- Verificar `CORS_ALLOWED_ORIGINS` en `.env`
- Verificar Nginx headers

### Error: Database connection failed
- Verificar PostgreSQL: `sudo systemctl status postgresql`
- Test conexión: `psql -h localhost -U ev3pi_user -d ev3pi_production`

---

## 📞 SOPORTE

Para más ayuda:
- Documentación Django: https://docs.djangoproject.com/en/5.0/howto/deployment/
- Gunicorn: https://docs.gunicorn.org/
- Nginx: https://nginx.org/en/docs/
