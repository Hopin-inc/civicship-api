# Development Workflow

This guide describes the day-to-day development steps and workflow for contributing to civicship-api.

## Daily Development Commands

### Start Development

```bash
# Start a Development Session
cd civicship-api

# Ensure You're on the Latest Developer Branch
git checkout develop
git pull origin develop

# Start the Database Container (If Not Running)
pnpm container:up

# Start the Development Server with Hot Reload
pnpm dev:https
```

### Basic Development Commands

```bash
# Run Linting (ESLint + Prettier Autofix)
pnpm lint

# Run Tests
pnpm test

# View Database Contents
pnpm db:studio

# Generate GraphQL Types
pnpm gql:generate

# Generate Prisma Client
pnpm db:generate
```

**For detailed command information, see the [Command Reference](COMMANDS.md). **

## Development Workflow

### 1. Feature Development

#### Create a New Feature Branch

```bash
# Create a feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix-name
```

#### Development Process

1. **Plan the Change:**
- Understand the Requirements
- Identify the Impacted Domain
- Plan Database Schema Changes as Needed

2. **Implement the Change:**
- Follow Domain-Driven Design Principles
- Maintain a Consistent Layer Structure
- Write Tests as You Develop

3. **Test the Change:**
   ``bash
# Run Relevant Tests
pnpm test -- --testPathPattern=your-feature

# Run All Tests
pnpm test

# Test the GraphQL Endpoint
# https://localhost:3000/graphql Use Apollo Server (introspection enabled) with .git.sh.
# Note: GraphQL Playground is not available.
# Use clients such as Apollo Studio, Insomnia, or Postman.
```

4. **Code Quality Checks:**
```bash
# Fix linting issues (ESLint + Prettier auto-fix)
pnpm lint

# TypeScript type checking (manual run)
npx tsc --noEmit

# Verify all tests pass
pnpm test
```

### 2. Database Schema Changes

For instructions on changing the database schema, see the "Database Operations" section in the [Command Reference](COMMANDS.md).

Basic Flow:
1. Edit `src/infrastructure/prisma/schema.prisma`
2. Create a migration with `pnpm db:migrate`
3. Regenerate the Prisma client with `pnpm db:generate`
4. Update GraphQL types with `pnpm gql:generate`

### 3. GraphQL Schema Changes

For information on GraphQL schema changes and best practices, see the "GraphQL Optimization Patterns" section in [Implementation Patterns](../PATTERNS.md).

### 4. Testing Strategy

For information on writing tests and using the factory pattern, see the [Testing Guide](../TESTING.md).

### 5. Code Review Process

#### PR Submission Checklist

**Basic Checks:**
- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Type checks pass (`npx tsc --noEmit`)
- [ ] Documentation is updated

**Quality Checks:**
- [ ] No console.log statements
- [ ] Appropriate error handling
- [ ] Security considerations are addressed
- [ ] Domain-Driven Design is followed

#### Create a Pull Request

```bash
# Commit changes
git add src/docs/
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/your-feature-name

# Create a PR with GitHub CLI
gh pr create --title "Add new feature" --body "Description of changes"
```

## Implementation Patterns and Best Practices

For code organization patterns, naming conventions, error handling, logging, performance optimization, and security best practices, see [Implementation Patterns](../PATTERNS.md).

## Debugging and Monitoring

For debugging, performance monitoring, and log review, see the "Debugging and Monitoring Commands" section of [Command Reference](COMMANDS.md).

## Related Documentation

### 📚 Detailed Guide
- **[Testing Guide](../TESTING.md)** - Testing strategy, factory pattern, test data management
- **[Implementation Pattern](../PATTERNS.md)** - DataLoader, DI, RLS, error handling, security patterns
- **[Command Reference](COMMANDS.md)** - All pnpm commands, debugging, and environment-specific execution methods

### 🔧 Setup and Operation
- **[Setup Guide](../SETUP.md)** - Initial environment setup procedure
- **[Environment Variable Settings](ENVIRONMENT.md)** - Detailed environment variable settings
- **[Troubleshooting](../TROUBLESHOOTING.md)** - Common problems and solutions

### 🏗️ Architecture and Design
- **[Architecture Guide](ARCHITECTURE.md)** - System design and domain structure
- **[Feature List](../FEATURES.md)** - Business feature details
- **[Database Design](../ERD.md)** - Entity-Relationship Diagram