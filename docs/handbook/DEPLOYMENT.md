# Deployment Guide

This document describes the civicship-api deployment architecture, CI/CD pipeline, infrastructure components, and production environment configuration.

## Deployment Architecture

### Multi-Service Deployment

civicship-api supports multiple deployment configurations, separating different responsibilities into services:

#### 1. Internal API (Main Service)

**Configuration:**
- **Entry Point:** `src/index.ts`
- **Purpose:** Main GraphQL API server
- **Dockerfile:** `Dockerfile`
- **Deployment:** Google Cloud Run
- **Port:** 3000 (HTTPS)

**Function:**
- GraphQL API endpoint
- Authentication and authorization processing
- Business logic execution
- Database access

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod

COPY .. .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

#### 2. External API (Public Wallet Operations)

**Configuration:**
- **Entry Point:** `src/external-api.ts`
- **Purpose:** Public wallet operations and external integration
- **Dockerfile:** `Dockerfile.external`
- **Deployment:** Google Cloud Run (separate service)
- **Port:** 8080

**Function:**
- Wallet operations from external systems
- Public API endpoint
- External partner integration
- Lightweight authentication

```dockerfile
# Dockerfile.external
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

EXPOSE 8080
CMD ["node", "dist/external-api.js"]
```

#### 3. Batch Processing (Background Jobs)

**Configuration:**
- **Entry Point:** `src/batch.ts`
- **Purpose:** Background job processing
- **Dockerfile:** `Dockerfile.batch`
- **Deployment:** Google Cloud Run Jobs
- **Execution:** Scheduled execution

**Function:**
- Materialized view updates
- Data aggregation
- Periodic cleanup
- Notification sending

```dockerfile
# Dockerfile.batch
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile --prod

COPY . .
RUN pnpm build

CMD ["node", "dist/batch.js"]
```

## Google Cloud Run Settings

### Service Settings

#### Internal API Settings

```yaml
# cloud-run-internal.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
name: civicship-api-internal
annotations:
run.googleapis.com/ingress: all
spec:
template:
metadata:
annotations:
run.googleapis.com/cpu-throttling: "false"
run.googleapis.com/memory: "2Gi"
run.googleapis.com/cpu: "1000m"
spec:
containerConcurrency: 100
containers:
- image: asia-northeast1-docker.pkg.dev/PROJECT_ID/civicship-api/civicship-api:latest
ports:
- containerPort: 3000
env:
- name: NODE_ENV
value: "production"
- name: DATABASE_URL
valueFrom:
secretKeyRef:
name: database-url
key: url
```

#### External API Settings

```yaml
# cloud-run-external.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
name: civicship-api-external
spec:
template:
spec:
containers:
- image: asia-northeast1-docker.pkg.dev/PROJECT_ID/civicship-api/civicship-api-external:latest
ports:
- containerPort: 8080
env:
- name: NODE_ENV
value: "production"
```

### Autoscaling

```yaml
# Scaling Settings
metadata:
annotations:
run.googleapis.com/execution-environment: gen2
autoscaling.knative.dev/minScale: "1"
autoscaling.knative.dev/maxScale: "100"
run.googleapis.com/cpu-throttling: "false"
```

Features:
- Automatic scaling based on request volume
- Minimum 1 instance, maximum 100 instances
- Cold start optimization
- Disabled CPU throttling

## CI/CD Pipeline

### GitHub Actions Workflow

**Configuration File:** `.github/workflows/deploy-to-cloud-run-dev.yml`

```yaml
name: Deploy to Cloud Run (Development)

on:
push:
branches: [ develop ]
pull_request:
branches: [ develop ]

jobs:
test:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v4
- name: Setup Node.js 20
uses: actions/setup-node@v4
with:
node-version: '20'
cache: 'pnpm'

- name: Install dependencies
run: pnpm install

- name: Run tests
run: pnpm test

- name: Run lint
run: pnpm lint

build-and-deploy:
needs: test
runs-on: ubuntu-latest 
if: github.ref == 'refs/heads/develop' 

steps: 
- uses: actions/checkout@v4 

- name: Setup Google Cloud CLI 
uses: google-github-actions/setup-gcloud@v1 
with: 
service_account_key: ${{ secrets.GCP_SA_KEY }} 
project_id: ${{ secrets.GCP_PROJECT_ID }} 

- name: Configure Docker 
run: gcloud auth configure-docker asia-northeast1-docker.pkg.dev 

- name: Build Docker images 
run: | 
docker build -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api:${{ github.sha }} . 
docker build -f Dockerfile.external -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-external:${{ github.sha }} . 
docker build -f Dockerfile.batch -t asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-batch:${{ github.sha }} . 

- name: Push to Container Registry 
run: | 
docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api:${{ github.sha }} 
docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-external:${{ github.sha }} 
docker push asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api-batch:${{ github.sha }} 

- name: Deploy to Cloud Run 
run: | 
gcloud run deploy civicship-api-internal \ 
--image asia-northeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/civicship-api/civicship-api:${{ github.sha }} \ 
--platform managed \ 
--region asia-northeast1 \ --allow-unauthenticated
```

### Multi-Environment Deployment

#### Development Environment
- **Branch:** `develop`
- **Automatic Deployment:** On Push
- **Database:** Development PostgreSQL
- **Domain:** `dev-api.civicship.com`

#### Staging Environment
- **Branch:** `staging`
- **Manual Approval:** Required
- **Database:** Staging PostgreSQL
- **Domain:** `staging-api.civicship.com`

#### Production Environment
- **Branch:** `main`
- **Manual Approval:** Required
- **Database:** Production PostgreSQL
- **Domain:** `api.civicship.com`

## Infrastructure Components

### Artifact Registry

```bash
# Container Registry Configuration
gcloud artifacts repositories create civicship-api \
--repository-format=docker \
--location=asia-northeast1 \
--description="Civicship API container images"
```

**Features**
- **Secure storage of Docker images**
- **Version control and tagging**
- **Vulnerability scanning**
- **Access control**

### Database access

#### SSH tunnel (build time)

```yaml
# Secure database access with GitHub Actions
- name: Setup SSH tunnel
run: |
echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
ssh -f -N -L 5432:localhost:5432 user@jumpbox.example.com

- name: Run database migrations
run: pnpm db:migrate deploy
env:
DATABASE_URL: postgresql://user:pass@localhost:5432/civicship
```

#### Production Database Connection

``` typescript
// Connection Pooling in a Production Environment
const prisma = new PrismaClient({
datasources: {
db: {
url: process.env.DATABASE_URL,
},
},
log: ['query', 'info', 'warn', 'error'],
});

// Connection Pool Configuration
// DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20
```

### Environment Variable Management

#### Google Secret Manager

``` bash
# Create a Secret
gcloud secrets create database-url --data-file=database-url.txt
gcloud secrets create firebase-private-key --data-file=firebase-key.json

# Using secrets with Cloud Run
gcloud run deploy civicship-api \
--set-secrets="DATABASE_URL=database-url:latest,FIREBASE_PRIVATE_KEY=firebase-private-key:latest"
```

#### Environment-Specific Settings

```yaml
# Development Environment
env:
- name: NODE_ENV
value: "development"
- name: LOG_LEVEL
value: "debug"

# Production Environment
env:
- name: NODE_ENV
value: "production"
- name: LOG_LEVEL
value: "info"
```

## Monitoring and Health Checks

### Health Check Endpoint

```typescript
// src/presentation/router/health.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
});

// Check database connection
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({status: 'unhealthy', database: 'disconnected' });
  }
});
```

### Cloud Run Health Monitoring

```yaml
# Health Check Configuration
spec:
template:
spec:
containers:
- image: asia-northeast1-docker.pkg.dev/PROJECT_ID/civicship-api/civicship-api:latest
livenessProbe:
httpGet:
path: /health
port: 3000
initialDelaySeconds: 30
periodSeconds: 10
readinessProbe:
httpGet:
path: /health/db
port: 3000
initialDelaySeconds: 5
periodSeconds: 5
```

### Log Monitoring

```typescript
// Structured Log Output
import { logger } from '../infrastructure/logger';

logger.info('Service started', {
service: 'civicship-api',
version: process.env.npm_package_version,
environment: process.env.NODE_ENV,
port: process.env.PORT || 3000
});

// Error Tracking
logger.error('Database connection failed', {
error: error.message,
stack: error.stack,
service: 'civicship-api'
});
```

## Security Considerations

### Container Security

```dockerfile
# Security-Enhanced Dockerfile
FROM node:20-alpine

# Create a Non-Root User
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Install Dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy Application Files
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
```

### Network security

```yaml
# VPC configuration
metadata:
annotations:
run.googleapis.com/vpc-access-connector: projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME
run.googleapis.com/vpc-access-egress: private-ranges-only
```

## Troubleshooting

### Deployment issues

```bash
# Check Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=civicship-api" --limit=50

# Check service status
gcloud run services describe civicship-api --region=asia-northeast1

# Check revision history
gcloud run revisions list --service=civicship-api --region=asia-northeast1
```

### Performance Monitoring

```bash
# Check Metrics
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"

# Alerting Settings
gcloud alpha monitoring policies create --policy-from-file=alerting-policy.yaml
```

## Related Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System Design Overview
- [Infrastructure Guide](./INFRASTRUCTURE.md) - External System Integration
- [Security Guide](./SECURITY.md) - Security Architecture
- [Performance Guide](./PERFORMANCE.md) - Optimization Strategies
- [Environment Variable Guide](./ENVIRONMENT.md) - Environment Settings
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem Resolution Guide