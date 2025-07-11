# Detailed Setup Guide

This guide provides comprehensive instructions for setting up the civicship-api development environment from scratch.

## Prerequisites

### Required Software

Before starting, ensure you have the following installed:

- **Node.js 20+** - JavaScript runtime ([Download](https://nodejs.org/))
- **pnpm** - Package manager (faster than npm/yarn)
  ```bash
  npm install -g pnpm
  ```
- **Docker** - For PostgreSQL container ([Download](https://www.docker.com/))
- **Git** - Version control ([Download](https://git-scm.com/))

### System Requirements
- **Operating System:** Linux, macOS, or Windows with WSL2
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Storage:** 2GB free space for dependencies and database

## Step-by-Step Setup

### 1. Project Installation

```bash
# Clone repository (if not already done)
git clone https://github.com/Hopin-inc/civicship-api.git
cd civicship-api

# Switch to develop branch
git checkout develop

# Install all dependencies
pnpm install
```

**Expected Output:**
- Dependencies installed successfully
- No security vulnerabilities reported
- `node_modules/` directory created

### 2. Environment Configuration

```bash
# Create environment file
cp .env.example .env

# Edit .env file with your configuration
# Use your preferred editor (nano, vim, code, etc.)
nano .env
```

**Required Configuration:**
See [Environment Variables Guide](./ENVIRONMENT.md) for complete variable list and values.

**Minimum Required Variables:**
```env
DATABASE_URL=postgresql://user:password@host:15432/civicship_dev
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GCS_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json
GCS_BUCKET_NAME=your_bucket_name
GCP_PROJECT_ID=your_gcp_project_id
```

### 3. Database Setup

```bash
# Start PostgreSQL 16.4 container (port 15432)
pnpm container:up

# Verify container is running
docker ps | grep postgres
```

**Expected Output:**
```
CONTAINER ID   IMAGE         COMMAND                  CREATED         STATUS         PORTS                     NAMES
abc123def456   postgres:16.4 "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:15432->5432/tcp   civicship-db
```

```bash
# Generate Prisma client from schema
pnpm db:generate
```

**Expected Output:**
- Prisma client generated successfully
- Type definitions created in `node_modules/.prisma/client/`

### 4. Database Seeding (Two-Step Process)

The database seeding process is divided into two steps to ensure proper data relationships:

```bash
# Step 1: Seed master data (cities, states, countries)
pnpm db:seed-master
```

**Expected Output:**
```
✅ Master data seeding completed
   - States: 47 records
   - Cities: 1,741 records
   - Countries: 195 records
```

```bash
# Step 2: Seed domain data (users, communities, opportunities)
pnpm db:seed-domain
```

**Expected Output:**
```
✅ Domain data seeding completed
   - Users: 10 records
   - Communities: 5 records
   - Opportunities: 15 records
   - Memberships: 25 records
```

**Verify Seeding:**
```bash
# Open Prisma Studio to view database contents
pnpm db:studio
```

### 5. GraphQL Type Generation

```bash
# Generate TypeScript types from GraphQL schema
pnpm gql:generate
```

**Expected Output:**
- GraphQL types generated in `src/types/generated/`
- Schema files processed successfully

**Verify Generated Files:**
```bash
# Check generated files exist
ls -la src/types/generated/
```

### 6. Build & Start Development Server

```bash
# Compile TypeScript to JavaScript
pnpm build
```

**Expected Output:**
- TypeScript compilation successful
- JavaScript files created in `dist/` directory

```bash
# Start HTTPS development server
pnpm dev:https
```

**Expected Output:**
```
🚀 Server ready at: https://localhost:3000/graphql
📊 GraphQL Playground: https://localhost:3000/graphql
🔍 Health check: https://localhost:3000/health
```

## Verification Steps

### 1. Database Connection

```bash
# Check if PostgreSQL container is running
docker ps | grep civicship

# Test database connection
pnpm db:studio
```

**Success Indicators:**
- Container shows "Up" status
- Prisma Studio opens in browser
- Database tables are visible with seeded data

### 2. GraphQL API

```bash
# Start server (if not already running)
pnpm dev:https

# Test GraphQL endpoint
curl -X POST https://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

**Expected Response:**
```json
{"data":{"__typename":"Query"}}
```

### 3. Authentication

```bash
# Check server logs for Firebase initialization
# Look for messages like:
# "Firebase Admin initialized successfully"
# "Authentication middleware loaded"
```

### 4. File Upload (GCS)

Test file upload functionality through GraphQL Playground:
1. Open https://localhost:3000/graphql
2. Execute image upload mutation
3. Verify file appears in GCS bucket

## Development Workflow

### Daily Development Commands

```bash
# Start development server with hot reload
pnpm dev:https

# Run tests
pnpm test

# Run linting
pnpm lint
pnpm lint:graphql

# Database operations
pnpm db:studio     # Open database browser
pnpm db:reset      # Reset database (careful!)
pnpm db:migrate    # Apply new migrations
```

### Code Generation Commands

```bash
# After modifying GraphQL schema
pnpm gql:generate

# After modifying Prisma schema
pnpm db:generate
pnpm db:migrate
```

### Container Management

```bash
# Start containers
pnpm container:up

# Stop containers
pnpm container:down

# View container logs
docker logs civicship-db

# Access PostgreSQL directly
docker exec -it civicship-db psql -U postgres -d civicship_dev
```

## Common Setup Issues

### Port Conflicts

**Problem:** Port 15432 already in use
```bash
# Find process using port
lsof -i :15432

# Kill process if necessary
kill -9 <PID>

# Or use different port in docker-compose.yaml
```

### Permission Issues

**Problem:** Docker permission denied
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo (not recommended for development)
sudo pnpm container:up
```

### Environment Variable Issues

**Problem:** Firebase authentication fails
- Check FIREBASE_PRIVATE_KEY has proper line breaks (`\n`)
- Verify service account has correct permissions
- Ensure Firebase project has Authentication enabled

**Problem:** Database connection fails
- Verify DATABASE_URL format
- Check PostgreSQL container is running
- Ensure database exists

### Memory Issues

**Problem:** Out of memory during build
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build
```

## Performance Optimization

### Development Server

```bash
# Use development mode for faster builds
NODE_ENV=development pnpm dev:https

# Enable TypeScript incremental compilation
# (already configured in tsconfig.json)
```

### Database Performance

```bash
# Monitor database performance
pnpm db:studio

# View slow queries (if needed)
docker exec -it civicship-db psql -U postgres -d civicship_dev \
  -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Next Steps

After successful setup:

1. **Explore the codebase:**
   - Read [Architecture Guide](./ARCHITECTURE.md)
   - Review [Domain Details](./DOMAINS.md)
   - Study [Implementation Patterns](./PATTERNS.md)

2. **Start development:**
   - Follow [Development Workflow](./DEVELOPMENT.md)
   - Run tests with `pnpm test`
   - Check code quality with `pnpm lint`

3. **Learn the API:**
   - Explore GraphQL Playground
   - Review existing queries and mutations
   - Test authentication flows

## Getting Help

If you encounter issues not covered in this guide:

1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review server logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all prerequisites are properly installed

## Related Documentation

- [Environment Variables](./ENVIRONMENT.md) - Configuration reference
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem resolution
- [Architecture Guide](./ARCHITECTURE.md) - System design
- [Development Workflow](./DEVELOPMENT.md) - Daily procedures
