# Deployment Guide

Complete guide for deploying PostgreSQL Health Monitor to production environments.

---

## What You'll Get

After deployment, you'll have a professional PostgreSQL monitoring dashboard:

![Dashboard Health Score](docs/screenshots/05-health-score.png)
*Real-time health monitoring with adaptive polling*

![Active Issues Dashboard](docs/screenshots/03-health-dashboard.png)
*Comprehensive issue detection and monitoring*

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Testing](#local-testing)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Platforms](#cloud-platforms)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)
8. [Performance Tuning](#performance-tuning)

---

## Prerequisites

### System Requirements

**Minimum**
- OS: Linux, macOS, or Windows Server
- CPU: 2 cores
- RAM: 1 GB
- Storage: 500 MB
- Network: Stable internet connection

**Recommended**
- CPU: 4+ cores
- RAM: 2+ GB
- Storage: 1 GB SSD
- Network: Low-latency connection to PostgreSQL

### Software Requirements

- **Docker** 20.10+ (for containerized deployment)
- **Node.js** 18+ (for building from source)
- **PostgreSQL** 12+ (the database being monitored)

### Network Requirements

- PostgreSQL server must be accessible (TCP port 5432)
- Dashboard server needs outbound connection to PostgreSQL
- (Optional) WebSocket support for real-time updates
- HTTPS recommended for production

---

## Local Testing

Before deploying, test locally:

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Access at `http://localhost:5176`

### 3. Test with Demo Data

```bash
# With URL parameter
http://localhost:5176?demo=true

# Toggle in UI
- Click settings or demo button if available
```

### 4. Verify Features

- [ ] Cluster Overview displays health score
- [ ] Metrics update every 2-10 seconds
- [ ] Animations are smooth (60 FPS)
- [ ] Mobile responsive design works
- [ ] Error handling gracefully handles failures
- [ ] Notifications appear correctly

### 5. Run Production Build

```bash
npm run build
npm run preview
```

Verify output in `dist/` folder (~200 KB gzip).

---

## Docker Deployment

### Build Docker Image

#### Option 1: Using Provided Dockerfile

```bash
docker build -t pg-health-monitor:latest .
```

#### Option 2: Multi-stage Build (Optimized)

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Run Container

#### Basic
```bash
docker run -d \
  --name pg-health-monitor \
  -p 8080:80 \
  pg-health-monitor:latest
```

#### With Environment Variables
```bash
docker run -d \
  --name pg-health-monitor \
  -p 8080:80 \
  -e VITE_API_URL=https://api.example.com \
  -e VITE_WS_URL=wss://api.example.com \
  pg-health-monitor:latest
```

#### With Volume Mount (for custom config)
```bash
docker run -d \
  --name pg-health-monitor \
  -p 8080:80 \
  -v /path/to/nginx.conf:/etc/nginx/nginx.conf \
  pg-health-monitor:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  pg-health-monitor:
    image: pg-health-monitor:latest
    container_name: pg-health-monitor
    ports:
      - "8080:80"
    environment:
      VITE_API_URL: ${API_URL:-http://localhost:8000}
      VITE_WS_URL: ${WS_URL:-ws://localhost:8000}
    networks:
      - pg-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Backend service
  backend:
    image: pg-health-backend:latest
    container_name: pg-health-backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/health
    networks:
      - pg-network
    depends_on:
      - postgres

  # Optional: PostgreSQL service (if monitoring locally)
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: health
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - pg-network
    ports:
      - "5432:5432"

networks:
  pg-network:
    driver: bridge

volumes:
  postgres_data:
```

Run with:
```bash
# Create .env file
echo "API_URL=http://backend:8000" > .env
echo "WS_URL=ws://backend:8000" >> .env

# Start services
docker-compose up -d
```

---

## Cloud Platforms

### AWS Deployment

#### ECS (Elastic Container Service)

1. **Push image to ECR**
   ```bash
   aws ecr create-repository --repository-name pg-health-monitor
   docker tag pg-health-monitor:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/pg-health-monitor:latest
   docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/pg-health-monitor:latest
   ```

2. **Create ECS Task Definition**
   ```json
   {
     "family": "pg-health-monitor",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "pg-health-monitor",
         "image": "<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/pg-health-monitor:latest",
         "portMappings": [
           {
             "containerPort": 80,
             "hostPort": 80,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "VITE_API_URL",
             "value": "https://api.example.com"
           }
         ]
       }
     ]
   }
   ```

3. **Create ECS Service**
   - Launch type: Fargate
   - VPC: Your VPC
   - Subnets: Public subnets
   - Load balancer: Application Load Balancer (ALB)

#### Elastic Beanstalk

```bash
# Initialize Elastic Beanstalk
eb init -p docker pg-health-monitor

# Create environment
eb create pg-health-monitor-env

# Deploy
eb deploy
```

### Google Cloud Platform

#### Cloud Run

```bash
# Build image
gcloud builds submit --tag gcr.io/<PROJECT_ID>/pg-health-monitor

# Deploy
gcloud run deploy pg-health-monitor \
  --image gcr.io/<PROJECT_ID>/pg-health-monitor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### App Engine

1. Create `app.yaml`:
   ```yaml
   runtime: nodejs18
   env: standard

   handlers:
   - url: .*
     script: auto
   ```

2. Deploy:
   ```bash
   gcloud app deploy
   ```

### Azure Deployment

#### Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name pg-health-monitor \
  --image pg-health-monitor:latest \
  --ports 80 \
  --environment-variables \
    VITE_API_URL=https://api.example.com
```

#### App Service (Docker)

1. Push to Azure Container Registry
2. Create App Service from image
3. Configure application settings

### Heroku (Legacy)

```bash
heroku create pg-health-monitor
heroku container:push web
heroku container:release web
```

---

## Environment Configuration

### Frontend Environment Variables

Set in `frontend/.env.production`:

```bash
# API Configuration
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com

# Feature Flags
VITE_ENABLE_DEMO_MODE=false
VITE_DEBUG=false

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id
```

### Backend Environment Variables

Set in `backend/.env`:

```bash
# PostgreSQL Connection
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Server Configuration
PORT=8000
ENVIRONMENT=production

# Security
CORS_ORIGIN=https://dashboard.example.com
API_KEY_SECRET=your-secret-key

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### Nginx Configuration

For reverse proxy setup, configure `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # Cache static assets
    location ~* \.(js|css|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache HTML (short)
    location ~* \.html$ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass ws://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SPA routing (all routes to index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

---

## Monitoring & Logging

### Health Checks

```bash
# HTTP health check
curl -f http://localhost/

# Expected response: 200 OK with HTML content

# With headers
curl -I http://localhost/
```

### Container Logs

```bash
# Docker logs
docker logs pg-health-monitor

# Docker logs with follow
docker logs -f pg-health-monitor

# Docker Compose logs
docker-compose logs -f pg-health-monitor
```

### Browser Monitoring

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Monitor WebSocket connection status

### Application Monitoring

Set up monitoring for:

- **Uptime**: Monitor HTTP 200 responses every 5 minutes
- **Performance**: Track page load time, API latency
- **Errors**: Alert on HTTP 5xx errors
- **SSL**: Certificate expiration warnings
- **Resource Usage**: CPU, memory, disk space

### Log Aggregation

Configure logging with services like:

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Datadog**: Comprehensive monitoring and logging
- **Papertrail**: Cloud-based log management
- **CloudWatch**: AWS native logging

Example Datadog setup:

```yaml
version: '3.8'
services:
  pg-health-monitor:
    image: pg-health-monitor:latest
    labels:
      com.datadoghq.ad.check_names: '["http_check"]'
      com.datadoghq.ad.init_configs: '[{}]'
      com.datadoghq.ad.instances: |
        [
          {
            "name": "pg-health-monitor",
            "url": "http://localhost",
            "timeout": 10
          }
        ]
```

---

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker logs pg-health-monitor

# Inspect image
docker inspect pg-health-monitor:latest

# Verify ports available
sudo lsof -i :80

# Rebuild if needed
docker build --no-cache -t pg-health-monitor:latest .
```

#### WebSocket Connection Failed

**Problem**: "WebSocket connection failed"

**Solutions**:
1. Verify backend is accessible
2. Check firewall rules (port 8000)
3. Verify WebSocket URL in environment
4. Check backend logs for errors
5. Enable debug logging

#### High Memory Usage

**Problem**: Container using >512 MB

**Solutions**:
1. Reduce polling frequency
2. Limit concurrent connections
3. Clear browser cache
4. Restart container
5. Check for memory leaks

#### Slow Performance

**Problem**: Dashboard slow to load or unresponsive

**Solutions**:
1. Check network latency
2. Monitor database query performance
3. Reduce number of metrics
4. Enable caching
5. Upgrade server resources

### Debug Mode

Enable debug logging:

```bash
# Environment variable
export VITE_DEBUG=true

# In browser console
window.__PG_HEALTH_DEBUG__ = true
```

Then check browser console for additional logging.

---

## Performance Tuning

### Frontend Optimization

1. **Enable compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json;
   ```

2. **Set cache headers**
   ```nginx
   expires 1y;
   add_header Cache-Control "public, immutable";
   ```

3. **Use CDN** for static assets

### Backend Optimization

1. **Database indexes** on monitored tables
2. **Connection pooling** with reasonable limits
3. **Query caching** for frequently accessed metrics
4. **Batch updates** instead of per-row

### Network Optimization

1. **HTTPS/TLS** with HTTP/2
2. **WebSocket** for real-time data
3. **Compression** for API responses
4. **Load balancing** for high traffic

### Resource Limits

Set appropriate Docker limits:

```bash
docker run \
  --memory="512m" \
  --cpus="0.5" \
  --name pg-health-monitor \
  pg-health-monitor:latest
```

---

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] CORS configured for specific origins
- [ ] Environment variables not committed to git
- [ ] Database credentials in secure vault
- [ ] API authentication implemented
- [ ] Regular dependency updates
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Access logs monitored
- [ ] Backup strategy in place

---

## Rollback Procedure

If deployment fails:

```bash
# Docker rollback
docker stop pg-health-monitor
docker run -d --name pg-health-monitor pg-health-monitor:previous-tag

# Kubernetes rollback
kubectl rollout undo deployment/pg-health-monitor

# AWS ECS rollback
# Update service to use previous task definition
```

---

## Getting Help

- Check deployment logs: `docker logs pg-health-monitor`
- Review architecture: See `ARCHITECTURE.md`
- Check issues: https://github.com/your/repo/issues
- Report problems: Create detailed issue with logs

---

## Next Steps

After deployment:

1. Verify all features working
2. Set up monitoring/alerts
3. Configure backups
4. Plan capacity scaling
5. Schedule security reviews
6. Document runbooks for your ops team
