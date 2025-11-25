# Command Reference

This document provides a comprehensive description of all commands available in the civicship-api project.

## Available pnpm Commands

### Development/Build

```bash
# Development Server
pnpm dev # HTTP Development Server (Port 3000)
pnpm dev:https # HTTPS Development Server (Port 3000, with SSL Certificate)
pnpm dev:external # External API Development Server (for Wallet Operations)

# Build/Run
pnpm build # TypeScript Compilation + Copy GraphQL Schema File
pnpm start # Start Application in Production Environment
pnpm copy-graphql # Copy Only GraphQL Schema File to dist/
```

### Code Quality

```bash
# Linting/Formatting
pnpm lint # Run ESLint + Prettier (with Auto-Fix)

# Testing
pnpm test # Run Jest Test Suite
pnpm test:coverage # Run Tests with Coverage Report
```

### Database Operations

```bash
# Prisma Basic Operations
pnpm db:pull # Reflect database schema to Prisma schema
pnpm db:generate # Generate Prisma client (including schema format)
pnpm db:studio # Launch Prisma Studio (Database GUI)

# Migration
pnpm db:migrate # Create new migration file
pnpm db:deploy # Apply migration to database
pnpm db:migrate-reset # Complete database reset (delete all data)
pnpm db:mark-rolled-back # Mark migration for rollback

# Data Seed
pnpm db:seed-master # Populate master data (city and state data)
pnpm db:seed-domain # Populate domain data (user and community data)
```

### GraphQL Operations

```bash
# Generate GraphQL types
pnpm gql:generate # Generate GraphQL type definitions (based on codegen.yaml)
```

### Docker operations

```bash
# Container management
pnpm container:up # Start a PostgreSQL container (port 15432)
pnpm container:down # Stop and delete a container
```

## Unavailable commands (Note)

The following commands are not currently included in package.json. Please use an alternative:

```bash
# Non-existent command
pnpm lint:graphql # → Error checking with pnpm gql:generate
pnpm gql:validate # → Use validation during development server startup
pnpm gql:diff # → Manual schema comparison
pnpm type-check # → npx tsc --noEmit
pnpm test:integration # → pnpm test -- --testPathPattern=integration
pnpm test:watch # → npx jest --watch
pnpm db:reset # → pnpm db:migrate-reset
```

## Alternative commands/Manual execution

### TypeScript type checking

```bash
# Manual type checking
npx tsc --noEmit

# Type checking during build
pnpm build
```

### GraphQL schema validation

```bash
# Error checking during code generation
pnpm gql:generate

# Testing when starting the development server
pnpm dev:https
# Errors, if any, are displayed on the console
```

### Test pattern matching

```bash
# Running integration tests
pnpm test -- --testPathPattern=integration

# Running unit tests
pnpm test -- --testPathPattern=unit

# Running authentication tests
pnpm test -- --testPathPattern=auth

# Testing specific files
pnpm test -- __tests__/unit/account/user.service.test.ts

# Watch mode
npx jest --watch
```

## Executing commands by environment

### Development environment

```bash
# Development environment settings
NODE_ENV=development pnpm dev:https

# Debug mode
DEBUG=prisma:query,graphql:* pnpm dev:https

# Log Level Settings
LOG_LEVEL=debug pnpm dev:https
```

### Test Environment

```bash
# Execute Commands in the Test Environment
NODE_ENV=test pnpm test

# Use Test Database
DATABASE_URL=postgresql://test:test@localhost:15432/civicship_test pnpm db:migrate
```

### Production Environment

```bash
# Production Build
NODE_ENV=production pnpm build

# Production Start
NODE_ENV=production pnpm start

# Production Test
NODE_ENV=production pnpm test
```

## Debugging and Monitoring Commands

### Application Debugging

```bash
# Node.js Debugger
node --inspect-brk dist/index.js

# Enable Debug Log
DEBUG=* pnpm dev:https

# Debugging a Specific Module
DEBUG=prisma:query pnpm dev:https
DEBUG=graphql:* pnpm dev:https
```

### Database Debugging

```bash
# Prisma Query Log
DEBUG=prisma:query pnpm dev:https

# Database Connection Check
pnpm db:studio
```

### Performance Monitoring

```bash
# Memory Usage Monitoring
node --inspect pnpm dev:https
# Profiling with chrome://inspect

# Log File Monitoring
tail -f logs/app.log
```

## Git and GitHub Operations

### Branch Operations

```bash
# Creating a Feature Branch
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Creating a Bug Fix Branch
git checkout -b fix/your-bug-fix-name
```

### Commit and push

```bash
# Stage changes
git add src/specific/file.ts
git add docs/

# Commit
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/your-feature-name
```

### Pull request

```bash
# Create a PR using GitHub CLI
gh pr create --title "Add new feature" --body "Description of changes"

# Check PR
gh pr view

# List PRs
gh pr list
```

## Docker and container operations

### PostgreSQL container

```bash
# Start container
pnpm container:up
# or
docker-compose up -d

# Stop container
pnpm container:down
# or
docker-compose down

# Check container status
docker ps

# Check container logs
docker-compose logs postgres
```

### Direct database connection

```bash
# Connect directly to PostgreSQL
psql postgresql://username:password@localhost:15432/civicship_dev

# Connect via Docker
docker exec -it civicship-api-postgres-1 psql -U username -d civicship_dev
```

## Build and deployment related

### Local build

```bash
# Clean build
rm -rf dist/
pnpm build

# Check build artifacts
ls -la dist/

# Production build test
NODE_ENV=production node dist/index.js
```

### Prepare for deployment

```bash
# Run all checks
pnpm lint
pnpm test
npx tsc --noEmit
pnpm build

# Check environment variables
echo $DATABASE_URL
echo $FIREBASE_PROJECT_ID
```

## Troubleshooting commands

### Dependency issues

```bash
# Reinstall node_modules
rm -rf node_modules/
rm pnpm-lock.yaml
pnpm install

# Clear cache
pnpm store prune
```

### Database issues

```bash
# Test database connection
pnpm db:studio

# Check migration status
npx prisma migrate status

# Reset database
pnpm db:migrate-reset
pnpm db:seed-master
pnpm db:seed-domain
```

### GraphQL issues

```bash
# Regenerate schema
pnpm gql:generate

# Check GraphQL endpoint
curl -X POST https://localhost:3000/graphql \
-H "Content-Type: application/json" \
-d '{"query":"{ __schema { types { name } } }"}'
```

## Related Documentation

- [Development Workflow](DEVELOPMENT.md) - Daily development procedures
- [Testing Guide](./TESTING.md) - Testing strategy and execution
- [Implementation Patterns](./PATTERNS.md) - Code implementation patterns
- [Setup Guide](./SETUP.md) - Initial environment setup
- [Troubleshooting](./TROUBLESHOOTING.md) - Problem-solving guide
