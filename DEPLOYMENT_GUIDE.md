# Skilltej Certify - Deployment Guide

## Production Deployment Instructions

This guide covers deploying Skilltej Certify to production environments.

---

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL/HTTPS certificates obtained
- [ ] Domain name configured
- [ ] CDN setup (optional)
- [ ] Monitoring and logging setup
- [ ] Security audit completed
- [ ] Load testing performed

---

## 🖥️ Server Requirements

### Minimum
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB (SSD recommended)
- Bandwidth: 1Mbps

### Recommended
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD
- Bandwidth: 10Mbps+
- CDN enabled
- Database replication

---

## 🐳 Docker Deployment

### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: skilltej_certify
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password_here
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:secure_password_here@postgres:5432/skilltej_certify
      SECRET_KEY: your-secret-key-here
      DEBUG: 'false'
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Deploy with:
```bash
docker-compose up -d
```

---

## ☁️ AWS Deployment

### Backend on EC2

1. **Launch EC2 Instance**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium or larger
   - Security Group: Allow ports 80, 443, 22

2. **Install Dependencies**
```bash
sudo apt update
sudo apt install python3-pip python3-venv postgresql-client nginx
```

3. **Setup Application**
```bash
cd /opt
sudo git clone https://github.com/yourusername/skilltej-certify.git
cd skilltej-certify/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **Configure Systemd Service**

Create `/etc/systemd/system/skilltej-backend.service`:
```ini
[Unit]
Description=Skilltej Certify Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/skilltej-certify/backend
ExecStart=/opt/skilltej-certify/backend/venv/bin/gunicorn app.main:app -w 4 -b 127.0.0.1:8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl start skilltej-backend
sudo systemctl enable skilltej-backend
```

5. **Configure Nginx**

Create `/etc/nginx/sites-available/skilltej`:
```nginx
upstream skilltej_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name api.skilltej.com;

    location / {
        proxy_pass http://skilltej_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/skilltej /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Database on RDS

1. **Create RDS Instance**
   - Engine: PostgreSQL
   - Instance class: db.t3.micro or larger
   - Storage: 20GB+ SSD
   - Multi-AZ: Yes (for production)

2. **Update Connection String**
```env
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/skilltej_certify
```

### Frontend on S3 + CloudFront

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Upload to S3**
```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

3. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Cache behavior: Default (24 hours)
   - SSL: ACM certificate

---

## 🔒 HTTPS/SSL Setup

### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d skilltej.com -d api.skilltej.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Update Nginx for HTTPS

```nginx
server {
    listen 443 ssl;
    server_name api.skilltej.com;

    ssl_certificate /etc/letsencrypt/live/api.skilltej.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.skilltej.com/privkey.pem;

    # ... rest of config
}

server {
    listen 80;
    server_name api.skilltej.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoring & Logging

### CloudWatch (AWS)

1. **Enable CloudWatch Logs**
```python
# In backend/app/main.py
import logging
from watchtower import CloudWatchLogHandler

logger = logging.getLogger(__name__)
logger.addHandler(CloudWatchLogHandler())
```

2. **Create Alarms**
   - High error rate
   - Database connection failures
   - Memory usage > 80%
   - Disk usage > 90%

### Sentry (Error Tracking)

1. **Install**
```bash
pip install sentry-sdk
```

2. **Configure**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()]
)
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

Alternative for advanced logging and visualization.

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Build and push backend
      run: |
        docker build -t skilltej-backend:latest ./backend
        docker push skilltej-backend:latest
    
    - name: Deploy to AWS
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      run: |
        # Deploy commands here
        aws ecs update-service --cluster skilltej --service backend --force-new-deployment
```

---

## 🛡️ Security Hardening

### Backend Security

1. **Update .env for Production**
```env
DEBUG=False
SECRET_KEY=generate-long-random-key-here
DATABASE_URL=postgresql://user:pass@host/db
CORS_ORIGINS=https://skilltej.com,https://www.skilltej.com
ALLOWED_HOSTS=api.skilltej.com
```

2. **Enable HTTPS Only**
```python
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.skilltej.com"]
)
```

3. **Add Security Headers**
```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### Database Security

1. **Use VPC**
   - Database in private subnet
   - Access only from application server

2. **Enable Encryption**
   - RDS encryption at rest
   - SSL connections only

3. **Backup Strategy**
   - Daily automated backups
   - 30-day retention
   - Cross-region replication

### Firewall Rules

- Allow port 80/443 from internet
- Allow port 22 (SSH) from specific IPs only
- Block all other inbound traffic
- Database only accessible from app servers

---

## 📈 Performance Optimization

### Caching

1. **Redis for Sessions**
```python
from fastapi_sessions.backends.implementations import SessionBackend

app.add_middleware(
    SessionMiddleware,
    secret_key="secret"
)
```

2. **HTTP Caching**
```python
from fastapi.responses import FileResponse

@app.get("/api/certifications")
def get_certs(cache_control: str = Header(...)):
    return {"certs": [...]}
```

### Database Optimization

1. **Connection Pooling**
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    echo=False
)
```

2. **Read Replicas** (optional)
   - Separate read-only replicas
   - Distribute load

### CDN for Static Assets

Configure CloudFront to serve:
- Frontend assets
- Images
- CSS/JS files

---

## 🔍 Health Checks

### Application Health Endpoint

```python
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Check database
        db.execute("SELECT 1")
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow()
        }
    except:
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }, 500
```

### Load Balancer Configuration

Configure health check:
```yaml
HealthCheck:
  Target: HTTP:8000/health
  Interval: 30
  Timeout: 5
  HealthyThreshold: 2
  UnhealthyThreshold: 3
```

---

## 📊 Database Backups

### Automated Backups

```bash
# Daily backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump skills_certify > /backups/db_$TIMESTAMP.sql
gzip /backups/db_$TIMESTAMP.sql
aws s3 cp /backups/db_$TIMESTAMP.sql.gz s3://skilltej-backups/
```

### Restore from Backup

```bash
gunzip < /backups/db_20240420_100000.sql.gz | psql skilltej_certify
```

---

## 🚀 Zero-Downtime Deployment

### Blue-Green Deployment

1. Deploy to "green" environment
2. Run tests
3. Switch load balancer to green
4. Keep blue as fallback

### Rolling Deployment

1. Update 1/4 of instances
2. Verify health
3. Continue with remaining instances

---

## 🆘 Troubleshooting Production Issues

### Application Won't Start

```bash
# Check logs
journalctl -u skilltej-backend -n 50

# Check dependencies
pip list

# Verify database connection
psql postgresql://user:pass@host/db -c "SELECT 1"
```

### High Memory Usage

```bash
# Check process memory
ps aux | grep python

# Restart service
sudo systemctl restart skilltej-backend
```

### Database Connection Issues

```bash
# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND duration > interval '1 hour';
```

---

## 📞 Support & Escalation

1. **Monitoring Alerts** → PagerDuty
2. **Error Tracking** → Sentry notifications
3. **On-call Schedule** → Manage rotation
4. **Runbooks** → Document procedures

---

## Useful Commands

```bash
# Check service status
sudo systemctl status skilltej-backend

# View logs
sudo journalctl -u skilltej-backend -f

# Restart service
sudo systemctl restart skilltej-backend

# Check disk usage
df -h

# Check memory
free -m

# Check network
netstat -tulpn | grep LISTEN
```

---

**For more information, refer to the main README.md**
