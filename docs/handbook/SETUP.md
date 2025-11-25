# Detailed Setup Guide

This guide provides instructions for setting up a civicship-api development environment from scratch.

## Prerequisites

### Required Software

Before you begin, make sure the following are installed:

- **Node.js 20+** - JavaScript runtime ([Download](https://nodejs.org/))
- **pnpm** - Package manager (faster than npm/yarn)
```bash
npm install -g pnpm
```
- **Docker** - For PostgreSQL containers ([Download](https://www.docker.com/))
- **Git** - Version control ([Download](https://git-scm.com/))

### System Requirements
- **Operating System:** Linux, macOS, or Windows with WSL2
- **Memory:** Minimum 4GB RAM, 8GB recommended
- **Storage:** 2GB free space for dependencies and the database

## Step-by-Step Setup

### 1. Installing the Project

```bash
# Clone the repository (if not already done)
git clone https://github.com/Hopin-inc/civicship-api.git
cd civicship-api

# Switch to the develop branch
git checkout develop

# Install all dependencies
pnpm install
```

**Expected output:**
- Dependencies are installed successfully
- No security vulnerabilities reported
- The `node_modules/` directory is created

### 2. Environment Setup

```bash
# Create an environment file
cp .env.example .env
```

**Required Settings:**
For a complete list of variables and values, see the [Environment Variables Guide](./ENVIRONMENT.md).

**Minimum required variables**
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
# Start the PostgreSQL 16.4 container (port 15432)
pnpm container:up

# Verify that the container is running.
docker ps | grep postgres
```

**Expected Output:**
```
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
abc123def456 postgres:16.4 "docker-entrypoint.s…" 2 minutes ago Up 2 minutes 0.0.0.0:15432->5432/tcp civicship-db
```

```bash
# Generate a Prisma client from the schema
pnpm db:generate
```

**Expected Output:**
- Prisma client successfully generated
- Type definitions created in `node_modules/.prisma/client/`

### 4. Database Seeding (Two-Step Process)

The database seeding process is divided into two steps to ensure proper data relationships:

```bash
# Step 1: Seed master data (city, state, country)
pnpm db:seed-master
```

```bash
# Step 2: Seed domain data (users, communities, opportunities)
pnpm db:seed-domain
```

**Verify seeding:**
```bash
# Open Prisma Studio and view database contents
pnpm db:studio
```

### 5. Generate GraphQL types

```bash
# Generate TypeScript types from GraphQL schema
pnpm gql:generate
```

**Expected output:**
- GraphQL types are generated in `src/types/`
- Schema file is processed successfully

### 6. Build and start development server

```bash
# Compile TypeScript to JavaScript
pnpm build
```

**Expected output:**
- TypeScript Compilation successful
- JavaScript files are created in the `dist/` directory

```bash
# Start the HTTPS development server
pnpm dev:https
```

**Expected output:**
```
🚀 GraphQL Playground: https://localhost:3000/graphql
🔍 Health check: https://localhost:3000/health
```

## Verification Steps

### 1. Database Connection

```bash
# Check if the PostgreSQL container is running
docker ps | grep civicship

# Test the Database Connection
pnpm db:studio
```

**Success Indicators**
- The container displays an "Up" status
- Prisma Studio opens in your browser
- The database table appears with seed data

### 2. GraphQL API

```bash
# Start the server (if not already running)
pnpm dev:https

# Test the GraphQL Endpoint
curl -X POST https://localhost:3000/graphql \
-H "Content-Type: application/json" \
-d '{"query":"query { __typename }"}'
```

**Expected response:**
```json
{"data":{"__typename":"Query"}}
```

### 3. Authentication

```bash
# Check the server log for Firebase initialization
# Look for messages like:
# "Firebase Admin initialized successfully"
# "Authentication middleware loaded"
```

### 4. File Upload (GCS)

Test the file upload function through the GraphQL Playground:
1. Open https://localhost:3000/graphql
2. Run the image upload mutation
3. Verify that the file appears in the GCS bucket

## Development Workflow

### Everyday Development Commands

```bash
# Start a development server with hot reloading
pnpm dev:https

# Run tests
pnpm test

# Run linting
pnpm lint
pnpm lint:graphql

# Database operations
pnpm db:studio # Open the database browser
pnpm db:reset # Reset the database (Caution!)
pnpm db:migrate # Apply a new migration
```

### Code generation commands

```bash
# After GraphQL schema changes
pnpm gql:generate

# After Prisma schema changes
pnpm db:generate
pnpm db:migrate
```

### Container management

```bash
# Start a container
pnpm container:up

# Stop a container
pnpm container:down

# View container logs
docker logs civicship-db

# Access PostgreSQL directly
docker exec -it civicship-db psql -U postgres -d civicship_dev
```

## Common setup issues

### Port conflict

**Problem:** Port 15432 is already in use
```bash
# Find the process using the port
lsof -i :15432

# Terminate the process if necessary
kill -9 <PID>

# Or use a different port in docker-compose.yaml
```

### Permission Issues

**Problem:** Docker Permission Denied
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo (not recommended for development)
sudo pnpm container:up
```

### Environment Variable Issues

**Problem:** Firebase Authentication Fails
- Ensure FIREBASE_PRIVATE_KEY has the appropriate line breaks (`\n`)
- Ensure the service account has the correct permissions
- Ensure authentication is enabled in your Firebase project

**Problem:** Database Connection Fails
- Verify the DATABASE_URL Format
- PostgreSQL Verify that the container is running
- Verify that the database exists

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
# (Already configured in tsconfig.json)
```

### Database Performance

```bash
# Monitor database performance
pnpm db:studio

# Show slow queries (optional)
docker exec -it civicship-db psql -U postgres -d civicship_dev \
-c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

## Next Steps

After successful setup:

1. **Explore the code base:**
- Read the [Architecture Guide](./ARCHITECTURE.md)
- Review the [Domain Details](./DOMAINS.md)
- Study the [Implementation Patterns](./PATTERNS.md)

2. **Start Development:**
- Follow the [Development Workflow](./DEVELOPMENT.md)
- Run tests with `pnpm test`
- Check code quality with `pnpm lint`

3. **Learn the API:**
- Explore the GraphQL Playground
- Review existing queries and mutations
- Test the authentication flow

## Getting Help

If you encounter an issue not covered in this guide:

1. [Troubleshooting Guide](TROUBLESHOOTING.md) Check the server log for error messages.
2. Check the server log for error messages.
3. Ensure all environment variables are set correctly.
4. Ensure all prerequisites are properly installed.

## Related Documentation

- [Environment Variables](./ENVIRONMENT.md) - Configuration Reference
- [Troubleshooting](TROUBLESHOOTING.md) - Problem Resolution
- [Architecture Guide](./ARCHITECTURE.md) - System Design
- [Development Workflow](./DEVELOPMENT.md) - Daily Procedures