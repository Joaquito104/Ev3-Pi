# ✅ Checklist de Despliegue Seguro - EV3-Pi

## 📋 Pre-Deploy (CRÍTICO - 30 minutos)

### 🔐 Credenciales y Secrets

- [ ] **Cambiar SECRET_KEY**
  ```bash
  # Generar nueva SECRET_KEY
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  
  # Copiar output a Backend/.env
  SECRET_KEY=<nueva-clave-generada>
  ```

- [ ] **Cambiar credenciales de base de datos**
  ```bash
  # Generar contraseña fuerte
  openssl rand -base64 32
  
  # Actualizar Backend/.env
  DB_USER=ev3pi_prod
  PASSWORD=<contraseña-generada>
  
  # Actualizar en PostgreSQL
  psql -U postgres
  ALTER USER admin WITH PASSWORD '<contraseña-generada>';
  CREATE USER ev3pi_prod WITH PASSWORD '<contraseña-generada>';
  GRANT ALL PRIVILEGES ON DATABASE test TO ev3pi_prod;
  ```

- [ ] **Cambiar contraseñas de usuarios del sistema**
  ```bash
  cd Backend
  python scripts/cambiar_credenciales.py
  # Opción 2: Cambiar interactivamente
  # Opción 3: Cambiar automáticamente
  ```

- [ ] **Configurar contraseña MongoDB**
  ```bash
  # Actualizar Backend/.env
  MONGODB_USERNAME=ev3pi_admin
  MONGODB_PASSWORD=<contraseña-fuerte-16-chars>
  ```

- [ ] **Configurar email (si aplica)**
  ```bash
  # Actualizar Backend/.env
  EMAIL_HOST_USER=noreply@tu-dominio.com
  EMAIL_HOST_PASSWORD=<app-password-gmail>
  ```

---

### 🌐 HTTPS y SSL/TLS

- [ ] **Obtener certificado SSL/TLS**
  ```bash
  # Opción 1: Let's Encrypt (gratis)
  sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
  
  # Opción 2: Cloudflare (gratis)
  # Ver: https://dash.cloudflare.com/
  
  # Opción 3: Certificado comercial
  # Comprar de DigiCert, GlobalSign, etc.
  ```

- [ ] **Activar forzado de HTTPS**
  ```bash
  # Actualizar Backend/.env
  SECURE_SSL_REDIRECT=True
  SESSION_COOKIE_SECURE=True
  CSRF_COOKIE_SECURE=True
  ```

- [ ] **Configurar HSTS**
  ```bash
  # Actualizar Backend/.env
  SECURE_HSTS_SECONDS=31536000
  SECURE_HSTS_INCLUDE_SUBDOMAINS=True
  SECURE_HSTS_PRELOAD=True
  ```

- [ ] **Verificar SSL con SSLLabs**
  ```
  https://www.ssllabs.com/ssltest/analyze.html?d=tu-dominio.com
  # Debe dar grado A o A+
  ```

---

### ⚙️ Configuración Django

- [ ] **Desactivar DEBUG**
  ```bash
  # Actualizar Backend/.env
  DEBUG=False
  ```

- [ ] **Configurar ALLOWED_HOSTS**
  ```bash
  # Actualizar Backend/.env
  ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com,api.tu-dominio.com
  ```

- [ ] **Configurar CORS**
  ```bash
  # Actualizar Backend/.env
  CORS_ALLOWED_ORIGINS=https://tu-dominio.com,https://www.tu-dominio.com
  # NO usar CORS_ALLOW_ALL_ORIGINS=True
  ```

- [ ] **Verificar rate limiting activo**
  ```python
  # Verificar en Backend/Django/settings.py
  REST_FRAMEWORK = {
      'DEFAULT_THROTTLE_CLASSES': [...],
      'DEFAULT_THROTTLE_RATES': {
          'anon': '100/hour',
          'user': '1000/hour',
          'login': '5/minute',
          'register': '3/hour'
      }
  }
  ```

---

### 💾 Base de Datos

- [ ] **PostgreSQL en servidor dedicado o RDS**
  ```bash
  # Verificar conexión
  psql -h tu-servidor-db.com -U ev3pi_prod -d ev3pi_production
  ```

- [ ] **Habilitar SSL en PostgreSQL**
  ```bash
  # Actualizar Backend/.env
  DB_SSL=require
  ```

- [ ] **Configurar backups automáticos**
  ```bash
  # Ejemplo con pg_dump
  crontab -e
  
  # Backup diario a las 2am
  0 2 * * * pg_dump -U ev3pi_prod ev3pi_production > /backups/ev3pi_$(date +\%Y\%m\%d).sql
  ```

- [ ] **MongoDB con autenticación TLS**
  ```bash
  # Actualizar Backend/.env
  MONGODB_TLS=True
  MONGODB_TLS_ALLOW_INVALID_CERTIFICATES=False
  ```

---

### 📊 Logging y Monitoreo

- [ ] **Crear directorio de logs**
  ```bash
  mkdir -p Backend/logs
  chmod 755 Backend/logs
  ```

- [ ] **Configurar logs externos (opcional)**
  ```bash
  # Opción 1: Papertrail
  # Ver: https://papertrailapp.com/
  
  # Opción 2: AWS CloudWatch
  # pip install boto3
  
  # Opción 3: ELK Stack
  # Docker Compose con Elasticsearch + Logstash + Kibana
  ```

- [ ] **Configurar alertas**
  ```bash
  # Ejemplo: Email on critical errors
  # Configurar en Django settings LOGGING['handlers']['mail_admins']
  ```

---

## 🚀 Despliegue (1 hora)

### 🐳 Opción 1: Docker (Recomendado)

- [ ] **Construir imagen**
  ```bash
  cd Backend
  docker build -t ev3pi-backend:latest .
  ```

- [ ] **Configurar docker-compose.yml**
  ```yaml
  # Verificar que incluye:
  # - PostgreSQL con volumen persistente
  # - Redis para cache
  # - Backend con gunicorn
  # - Nginx con SSL
  ```

- [ ] **Deploy con Docker Compose**
  ```bash
  docker-compose up -d
  docker-compose logs -f
  ```

### 🖥️ Opción 2: VPS Tradicional

- [ ] **Instalar dependencias**
  ```bash
  sudo apt update && sudo apt upgrade -y
  sudo apt install python3.11 python3.11-venv postgresql redis-server nginx -y
  sudo apt install libargon2-dev -y
  ```

- [ ] **Clonar repositorio**
  ```bash
  cd /var/www
  git clone <repo-url> ev3pi
  cd ev3pi
  ```

- [ ] **Crear entorno virtual**
  ```bash
  python3.11 -m venv .venv
  source .venv/bin/activate
  pip install -r Backend/requirements.txt
  ```

- [ ] **Aplicar migraciones**
  ```bash
  cd Backend
  python manage.py migrate
  python manage.py collectstatic --no-input
  ```

- [ ] **Configurar Gunicorn**
  ```bash
  # Crear /etc/systemd/system/ev3pi.service
  sudo nano /etc/systemd/system/ev3pi.service
  
  # Copiar contenido de DEPLOY.md sección "Configuración Gunicorn"
  
  sudo systemctl enable ev3pi
  sudo systemctl start ev3pi
  sudo systemctl status ev3pi
  ```

- [ ] **Configurar Nginx**
  ```bash
  # Crear /etc/nginx/sites-available/ev3pi
  sudo nano /etc/nginx/sites-available/ev3pi
  
  # Copiar contenido de DEPLOY.md sección "Configuración Nginx"
  
  sudo ln -s /etc/nginx/sites-available/ev3pi /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  ```

---

## ✅ Post-Deploy (30 minutos)

### 🔍 Verificación

- [ ] **Ejecutar check_security.py**
  ```bash
  cd Backend
  python scripts/check_security.py
  
  # Debe dar puntuación 95%+
  # Máximo 2 advertencias
  # 0 errores críticos
  ```

- [ ] **Health check**
  ```bash
  curl https://tu-dominio.com/api/health/
  # Debe retornar 200 OK
  ```

- [ ] **Test login**
  ```bash
  curl -X POST https://tu-dominio.com/api/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"<nueva-contraseña>"}'
  
  # Debe retornar access + refresh tokens
  ```

- [ ] **Verificar rate limiting**
  ```bash
  # Intentar 10 logins fallidos rápidamente
  for i in {1..10}; do
    curl -X POST https://tu-dominio.com/api/login/ \
      -H "Content-Type: application/json" \
      -d '{"username":"test","password":"wrong"}' &
  done
  
  # A partir del intento 6 debe retornar 429 (Too Many Requests)
  ```

- [ ] **Verificar SSL**
  ```bash
  # Test con SSLLabs
  https://www.ssllabs.com/ssltest/analyze.html?d=tu-dominio.com
  
  # Test con OpenSSL
  openssl s_client -connect tu-dominio.com:443 -tls1_2
  
  # Test con curl
  curl -I https://tu-dominio.com
  # Debe incluir Strict-Transport-Security header
  ```

- [ ] **Verificar headers de seguridad**
  ```bash
  curl -I https://tu-dominio.com | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options"
  
  # O usar: https://securityheaders.com/?q=tu-dominio.com
  # Debe dar grado A
  ```

---

### 📝 Logs y Monitoreo

- [ ] **Verificar logs de aplicación**
  ```bash
  # Docker
  docker-compose logs -f backend
  
  # VPS
  tail -f /var/www/ev3pi/Backend/logs/security.log
  journalctl -u ev3pi -f
  ```

- [ ] **Verificar logs de Nginx**
  ```bash
  tail -f /var/log/nginx/access.log
  tail -f /var/log/nginx/error.log
  ```

- [ ] **Verificar logs de PostgreSQL**
  ```bash
  tail -f /var/log/postgresql/postgresql-*.log
  ```

- [ ] **Configurar monitoreo (Opcional)**
  ```bash
  # Opción 1: Uptime Robot (gratis)
  # https://uptimerobot.com/
  
  # Opción 2: Pingdom
  # https://www.pingdom.com/
  
  # Opción 3: Datadog
  # https://www.datadoghq.com/
  ```

---

### 🧪 Testing de Seguridad

- [ ] **OWASP ZAP - Scan automático**
  ```bash
  # Descargar: https://www.zaproxy.org/download/
  # Ejecutar scan básico contra https://tu-dominio.com
  ```

- [ ] **Burp Suite - Test manual**
  ```bash
  # Descargar: https://portswigger.net/burp/communitydownload
  # Probar inyección SQL, XSS, CSRF
  ```

- [ ] **Tests manuales críticos**
  ```
  1. Inyección SQL:
     - Login: username=' OR '1'='1'--
     - Búsqueda: search='; DROP TABLE users;--
  
  2. XSS:
     - Input: <script>alert('XSS')</script>
     - Input: <img src=x onerror="alert('XSS')">
  
  3. CSRF:
     - Desactivar CSRF token y probar POST
  
  4. Brute Force:
     - 10 intentos fallidos de login
     - Debe bloquearse después de 5
  
  5. Session Hijacking:
     - Copiar token JWT
     - Cerrar sesión
     - Usar token antiguo
     - Debe retornar 401 Unauthorized
  ```

---

### 📊 Métricas Finales

- [ ] **Puntuación check_security.py**: ___% (meta: 95%+)
- [ ] **SSL Labs Grade**: ___ (meta: A+)
- [ ] **SecurityHeaders.com Grade**: ___ (meta: A)
- [ ] **OWASP ZAP Vulnerabilidades**: ___ (meta: 0 high, 0 medium)
- [ ] **Tiempo de respuesta promedio**: ___ms (meta: <500ms)
- [ ] **Uptime primer día**: ___% (meta: 99.9%+)

---

## 🚨 Troubleshooting

### Error: 502 Bad Gateway

```bash
# Verificar Gunicorn
sudo systemctl status ev3pi
journalctl -u ev3pi -n 50

# Verificar permisos socket
ls -l /var/www/ev3pi/Backend/gunicorn.sock

# Reiniciar servicios
sudo systemctl restart ev3pi
sudo systemctl restart nginx
```

### Error: Database connection failed

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Test conexión
psql -h localhost -U ev3pi_prod -d ev3pi_production

# Verificar credenciales en .env
cat Backend/.env | grep DB_
```

### Error: CORS blocked

```bash
# Verificar CORS_ALLOWED_ORIGINS en .env
cat Backend/.env | grep CORS

# Verificar Nginx headers
curl -I https://tu-dominio.com | grep -i access-control
```

### Error: Rate limit no funciona

```bash
# Verificar Redis
redis-cli ping
# Debe retornar PONG

# Verificar configuración en settings.py
grep -A 10 "DEFAULT_THROTTLE" Backend/Django/settings.py
```

---

## 📞 Contactos de Emergencia

- **Lead Developer**: [email/teléfono]
- **DevOps**: [email/teléfono]
- **Product Owner**: [email/teléfono]
- **Soporte Hosting**: [email/teléfono]

---

## 📚 Recursos

- [SECURITY.md](SECURITY.md) - Informe completo de seguridad
- [DEPLOY.md](DEPLOY.md) - Guía detallada de despliegue
- [.env.example](Backend/.env.example) - Template de configuración
- [scripts/check_security.py](Backend/scripts/check_security.py) - Auditor automático

---

**✅ Checklist completado**: ___/50 items

**🏆 Sistema listo para producción**: ☐ Sí  ☐ No

**📅 Fecha de deploy**: ___________

**👤 Responsable**: ___________

---

**Firma Product Owner**: _______________ **Fecha**: _______

**Firma DevOps**: _______________ **Fecha**: _______

**Firma QA**: _______________ **Fecha**: _______
