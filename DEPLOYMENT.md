# 🚀 Production Deployment Guide

This guide covers deploying Socially to production environments with best practices for security, scalability, and reliability.

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] **Database**: PostgreSQL 14+ cluster with read replicas
- [ ] **Cache**: Redis 6+ cluster or managed service
- [ ] **Storage**: AWS S3 or compatible object storage
- [ ] **CDN**: CloudFront or similar for static assets
- [ ] **Load Balancer**: Application Load Balancer with SSL termination
- [ ] **Monitoring**: Sentry, DataDog, or New Relic setup
- [ ] **Email**: SendGrid or similar service configured
- [ ] **DNS**: Domain with proper SSL certificates

### Security Configuration
- [ ] **Environment Variables**: All secrets properly configured
- [ ] **Database**: SSL connections enabled
- [ ] **Rate Limiting**: Configured and tested
- [ ] **CORS**: Properly restricted origins
- [ ] **Headers**: Security headers implemented
- [ ] **Firewall**: Network security groups configured
- [ ] **Backups**: Automated database backups enabled

### Performance Optimization
- [ ] **Database Indexes**: All queries optimized
- [ ] **Caching**: Redis cache warmed up
- [ ] **CDN**: Static assets cached and compressed
- [ ] **Image Optimization**: WebP conversion pipeline
- [ ] **Code Splitting**: Frontend bundles optimized

## 🐳 Docker Deployment

### 1. Build Production Images

```bash
# Build backend image
docker build -f backend/Dockerfile.prod -t socially-backend:latest ./backend

# Build frontend image
docker build -f Dockerfile.frontend -t socially-frontend:latest .
```

### 2. Deploy with Docker Compose

```bash
# Copy production environment template
cp .env.production.template .env.production

# Edit with your production values
nano .env.production

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Initialize Database

```bash
# Run migrations
docker exec socially-backend-prod npx prisma migrate deploy

# Seed with initial data (optional)
docker exec socially-backend-prod npm run db:seed
```

## ☁️ AWS Deployment

### 1. ECS with Fargate

#### Task Definition (backend-task-definition.json)
```json
{
  "family": "socially-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/sociallyTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_URI/socially-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:socially/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/socially-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Deploy Commands
```bash
# Create ECR repositories
aws ecr create-repository --repository-name socially-backend
aws ecr create-repository --repository-name socially-frontend

# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

docker tag socially-backend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/socially-backend:latest
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/socially-backend:latest

# Register task definition
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json

# Create or update service
aws ecs create-service \
  --cluster production \
  --service-name socially-backend \
  --task-definition socially-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 2. RDS PostgreSQL Setup

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier socially-production \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username socially \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp2 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name production-subnet-group \
  --backup-retention-period 7 \
  --multi-az \
  --auto-minor-version-upgrade
```

### 3. ElastiCache Redis Setup

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id socially-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxx \
  --cache-subnet-group-name production-cache-subnet
```

## 🌐 Kubernetes Deployment

### 1. Namespace and ConfigMap

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: socially-production
---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: socially-config
  namespace: socially-production
data:
  NODE_ENV: "production"
  FRONTEND_URL: "https://socially.app"
  REDIS_URL: "redis://redis-service:6379"
```

### 2. Secrets

```yaml
# secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: socially-secrets
  namespace: socially-production
type: Opaque
data:
  DATABASE_URL: # base64 encoded
  JWT_SECRET: # base64 encoded
  LINKEDIN_CLIENT_SECRET: # base64 encoded
```

### 3. Backend Deployment

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: socially-backend
  namespace: socially-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: socially-backend
  template:
    metadata:
      labels:
        app: socially-backend
    spec:
      containers:
      - name: backend
        image: socially-backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: socially-config
        - secretRef:
            name: socially-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: socially-backend-service
  namespace: socially-production
spec:
  selector:
    app: socially-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

### 4. Frontend Deployment

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: socially-frontend
  namespace: socially-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: socially-frontend
  template:
    metadata:
      labels:
        app: socially-frontend
    spec:
      containers:
      - name: frontend
        image: socially-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: socially-frontend-service
  namespace: socially-production
spec:
  selector:
    app: socially-frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

### 5. Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: socially-ingress
  namespace: socially-production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - socially.app
    - api.socially.app
    secretName: socially-tls
  rules:
  - host: socially.app
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: socially-frontend-service
            port:
              number: 80
  - host: api.socially.app
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: socially-backend-service
            port:
              number: 3001
```

### 6. Deploy to Kubernetes

```bash
# Apply configurations
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml

# Verify deployment
kubectl get pods -n socially-production
kubectl get services -n socially-production
kubectl get ingress -n socially-production
```

## 📊 Monitoring Setup

### 1. Prometheus & Grafana

```yaml
# monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'socially-backend'
      static_configs:
      - targets: ['socially-backend-service:3001']
      metrics_path: '/metrics'
```

### 2. Application Metrics

Add to your backend application:

```typescript
// metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} ${getRequestCount('GET', 200)}

# HELP active_users Current number of active users
# TYPE active_users gauge
active_users ${getActiveUserCount()}
  `);
});
```

## 🔐 SSL & Security

### 1. Let's Encrypt with Cert-Manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@socially.app
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 2. Security Headers

Ensure nginx.conf includes:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## 📈 Scaling Guidelines

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: socially-backend-hpa
  namespace: socially-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: socially-backend
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🔄 CI/CD Pipeline

### GitHub Actions Deployment

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to ECS
      run: |
        aws ecs update-service \
          --cluster production \
          --service socially-backend \
          --force-new-deployment
```

## 🛠️ Post-Deployment Verification

### Health Checks

```bash
# Backend health
curl -f https://api.socially.app/health

# Frontend health  
curl -f https://socially.app/

# Database connectivity
curl -f https://api.socially.app/health/database

# Redis connectivity
curl -f https://api.socially.app/health/redis
```

### Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery
artillery quick --count 100 --num 10 https://api.socially.app/health
```

## 📚 Additional Resources

- [Production Checklist](PRODUCTION_CHECKLIST.md)
- [Monitoring & Alerting](MONITORING.md)
- [Backup & Recovery](BACKUP.md)
- [Security Guidelines](SECURITY.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

For support with production deployment, contact [devops@socially.app](mailto:devops@socially.app)