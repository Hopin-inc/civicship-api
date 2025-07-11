# Development Workflow

This guide covers daily development procedures, best practices, and workflows for contributing to civicship-api.

## Daily Development Commands

### Starting Development

```bash
# Start your development session
cd civicship-api

# Ensure you're on the latest develop branch
git checkout develop
git pull origin develop

# Start database container (if not running)
pnpm container:up

# Start development server with hot reload
pnpm dev:https
```

### Code Quality Checks

```bash
# Run linting (fix automatically where possible)
pnpm lint
pnpm lint:graphql

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode (during development)
pnpm test:watch
```

### Database Operations

```bash
# View database contents
pnpm db:studio

# Generate Prisma client after schema changes
pnpm db:generate

# Create new migration
pnpm db:migrate dev --name your-migration-name

# Reset database (careful - deletes all data!)
pnpm db:reset

# Seed database with fresh data
pnpm db:seed-master
pnpm db:seed-domain
```

### GraphQL Operations

```bash
# Generate GraphQL types after schema changes
pnpm gql:generate

# Validate GraphQL schema
pnpm gql:validate

# Check GraphQL schema for breaking changes
pnpm gql:diff
```

## Development Workflow

### 1. Feature Development

#### Creating a New Feature Branch

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-fix-name
```

#### Development Process

1. **Plan your changes:**
   - Understand the requirements
   - Identify affected domains
   - Plan database schema changes if needed

2. **Implement changes:**
   - Follow domain-driven design principles
   - Maintain consistent layer structure
   - Write tests as you develop

3. **Test your changes:**
   ```bash
   # Run relevant tests
   pnpm test -- --testPathPattern=your-feature
   
   # Run integration tests
   pnpm test:integration
   
   # Test GraphQL endpoints
   # Use GraphQL Playground at https://localhost:3000/graphql
   ```

4. **Code quality checks:**
   ```bash
   # Fix linting issues
   pnpm lint --fix
   
   # Check types
   pnpm type-check
   
   # Ensure all tests pass
   pnpm test
   ```

### 2. Database Schema Changes

#### Making Schema Changes

1. **Update Prisma schema:**
   ```bash
   # Edit src/infrastructure/prisma/schema.prisma
   nano src/infrastructure/prisma/schema.prisma
   ```

2. **Generate migration:**
   ```bash
   # Create migration file
   pnpm db:migrate dev --name add-new-field
   ```

3. **Update application code:**
   ```bash
   # Regenerate Prisma client
   pnpm db:generate
   
   # Update TypeScript types
   pnpm gql:generate
   ```

4. **Update seeds if necessary:**
   ```bash
   # Edit seed files
   nano src/infrastructure/prisma/seeds/domain/your-domain.ts
   
   # Test seeding
   pnpm db:reset
   pnpm db:seed-master
   pnpm db:seed-domain
   ```

#### Migration Best Practices

- **Always review generated migrations** before applying
- **Test migrations on sample data** before production
- **Create rollback plan** for complex migrations
- **Update documentation** for schema changes

### 3. GraphQL Schema Changes

#### Adding New Types/Fields

1. **Define GraphQL schema:**
   ```bash
   # Edit domain-specific schema files
   nano src/application/domain/your-domain/schema/your-type.graphql
   ```

2. **Generate types:**
   ```bash
   pnpm gql:generate
   ```

3. **Implement resolvers:**
   ```typescript
   // src/application/domain/your-domain/controller/resolver.ts
   export const yourResolver = {
     Query: {
       yourQuery: async (parent, args, context) => {
         // Implementation
       }
     }
   };
   ```

4. **Add DataLoaders if needed:**
   ```typescript
   // src/application/domain/your-domain/controller/dataloader.ts
   export const yourDataLoader = new DataLoader(async (ids) => {
     // Batch loading implementation
   });
   ```

#### GraphQL Best Practices

- **Use DataLoaders** to prevent N+1 queries
- **Implement proper authorization** rules
- **Follow naming conventions** (camelCase for fields)
- **Add proper error handling**
- **Document complex queries** with comments

### 4. Testing Strategy

#### Test Types

1. **Unit Tests:**
   ```bash
   # Test individual functions/services
   pnpm test -- --testPathPattern=unit
   ```

2. **Integration Tests:**
   ```bash
   # Test database interactions
   pnpm test -- --testPathPattern=integration
   ```

3. **End-to-End Tests:**
   ```bash
   # Test complete API flows
   pnpm test -- --testPathPattern=e2e
   ```

#### Writing Tests

1. **Service Tests:**
   ```typescript
   // __tests__/unit/services/user.service.test.ts
   describe('UserService', () => {
     let userService: UserService;
     let mockRepository: jest.Mocked<IUserRepository>;
   
     beforeEach(() => {
       mockRepository = createMockRepository();
       userService = new UserService(mockRepository);
     });
   
     it('should create user', async () => {
       const userData = createUserData();
       const result = await userService.createUser(userData);
       expect(result).toBeDefined();
     });
   });
   ```

2. **GraphQL Tests:**
   ```typescript
   // __tests__/integration/graphql/user.test.ts
   describe('User GraphQL', () => {
     it('should query user by id', async () => {
       const user = await createTestUser();
       const query = gql`
         query GetUser($id: ID!) {
           user(id: $id) {
             id
             name
             email
           }
         }
       `;
       
       const result = await client.query({
         query,
         variables: { id: user.id }
       });
       
       expect(result.data.user).toMatchObject({
         id: user.id,
         name: user.name
       });
     });
   });
   ```

#### Test Data Management

1. **Use Factories:**
   ```typescript
   // __tests__/fixtures/factories/user.factory.ts
   export const createUser = (overrides?: Partial<User>): User => ({
     id: faker.datatype.uuid(),
     name: faker.name.fullName(),
     email: faker.internet.email(),
     ...overrides
   });
   ```

2. **Clean Up Test Data:**
   ```typescript
   afterEach(async () => {
     await prisma.$transaction([
       prisma.participation.deleteMany(),
       prisma.reservation.deleteMany(),
       prisma.user.deleteMany()
     ]);
   });
   ```

### 5. Code Review Process

#### Before Submitting PR

1. **Self-review checklist:**
   - [ ] All tests pass
   - [ ] Linting passes
   - [ ] Type checking passes
   - [ ] Documentation updated
   - [ ] No console.log statements
   - [ ] Proper error handling
   - [ ] Security considerations addressed

2. **Performance checklist:**
   - [ ] DataLoaders used for related data
   - [ ] Database queries optimized
   - [ ] No N+1 query problems
   - [ ] Proper indexing for new queries

3. **Code quality checklist:**
   - [ ] Follows domain-driven design
   - [ ] Consistent with existing patterns
   - [ ] Proper separation of concerns
   - [ ] Clear variable/function names
   - [ ] Appropriate comments for complex logic

#### Creating Pull Request

```bash
# Ensure all changes are committed
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/your-feature-name

# Create PR using GitHub CLI or web interface
gh pr create --title "Add new feature" --body "Description of changes"
```

#### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
```

## Code Organization Patterns

### Domain Structure

Follow the established domain pattern:

```
src/application/domain/your-domain/
├── controller/
│   ├── resolver.ts      # GraphQL resolvers
│   └── dataloader.ts    # Data loading optimization
├── usecase.ts          # Business logic orchestration
├── service.ts          # Core domain operations
├── data/
│   ├── repository.ts   # Data access implementation
│   ├── interface.ts    # Repository contracts
│   ├── converter.ts    # Data transformation
│   └── type.ts         # Domain types
├── schema/             # GraphQL schema files
└── presenter.ts        # Response formatting
```

### Naming Conventions

#### Files and Directories
- **Files:** kebab-case (`user-service.ts`)
- **Directories:** kebab-case (`user-management/`)
- **Test files:** `*.test.ts` or `*.spec.ts`

#### Code Elements
- **Variables/Functions:** camelCase (`getUserById`)
- **Classes:** PascalCase (`UserService`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces:** PascalCase with 'I' prefix (`IUserRepository`)
- **Types:** PascalCase (`UserCreateInput`)

#### GraphQL Schema
- **Types:** PascalCase (`User`, `Community`)
- **Fields:** camelCase (`firstName`, `createdAt`)
- **Enums:** UPPER_SNAKE_CASE (`USER_ROLE`)
- **Input types:** PascalCase with suffix (`CreateUserInput`)

### Error Handling

#### Service Layer
```typescript
export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // Validate input
      await this.validateUserData(data);
      
      // Business logic
      const user = await this.repository.create(data);
      
      return user;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new UserInputError(error.message);
      }
      
      // Log unexpected errors
      logger.error('Failed to create user', { error, data });
      throw new InternalServerError('User creation failed');
    }
  }
}
```

#### GraphQL Resolvers
```typescript
export const userResolver = {
  Mutation: {
    createUser: async (parent, args, context) => {
      try {
        return await context.services.user.createUser(args.input);
      } catch (error) {
        // Let GraphQL error handling middleware handle it
        throw error;
      }
    }
  }
};
```

### Logging

#### Development Logging
```typescript
import { logger } from '../infrastructure/logger';

// Different log levels
logger.debug('Debug information', { userId, action });
logger.info('User created successfully', { userId });
logger.warn('Deprecated API used', { endpoint });
logger.error('Database connection failed', { error });
```

#### Production Logging
- **Avoid logging sensitive data** (passwords, tokens)
- **Use structured logging** with consistent fields
- **Include correlation IDs** for request tracking
- **Log performance metrics** for monitoring

## Environment Management

### Development Environment

```bash
# Use development-specific settings
NODE_ENV=development
DEBUG=prisma:query,graphql:*
LOG_LEVEL=debug
```

### Testing Environment

```bash
# Use test database and mocked services
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:15432/civicship_test
```

### Production Environment

```bash
# Use production settings
NODE_ENV=production
LOG_LEVEL=info
# All secrets from environment variables
```

## Performance Optimization

### Database Optimization

1. **Use DataLoaders:**
   ```typescript
   // Batch related queries
   const users = await context.dataloaders.user.loadMany(userIds);
   ```

2. **Optimize queries:**
   ```typescript
   // Include related data in single query
   const user = await prisma.user.findUnique({
     where: { id },
     include: {
       memberships: {
         include: {
           community: true
         }
       }
     }
   });
   ```

3. **Use database indexes:**
   ```prisma
   model User {
     id    String @id
     email String @unique
     
     @@index([email])
     @@index([createdAt])
   }
   ```

### GraphQL Optimization

1. **Implement field-level caching:**
   ```typescript
   const resolvers = {
     User: {
       communities: async (user, args, context) => {
         return context.dataloaders.userCommunities.load(user.id);
       }
     }
   };
   ```

2. **Use query complexity analysis:**
   ```typescript
   const server = new ApolloServer({
     typeDefs,
     resolvers,
     plugins: [
       depthLimit(10),
       costAnalysis({ maximumCost: 1000 })
     ]
   });
   ```

## Security Best Practices

### Authentication
- **Always validate JWT tokens**
- **Check token expiration**
- **Verify token issuer**
- **Handle token refresh properly**

### Authorization
- **Implement role-based access control**
- **Use GraphQL shield for declarative rules**
- **Apply row-level security**
- **Validate user permissions at multiple layers**

### Data Protection
- **Never log sensitive data**
- **Sanitize user inputs**
- **Use parameterized queries**
- **Implement rate limiting**

### API Security
- **Validate all inputs**
- **Implement CORS properly**
- **Use HTTPS in production**
- **Monitor for suspicious activity**

## Monitoring and Debugging

### Local Debugging

1. **Use debugger:**
   ```bash
   # Start with debugger
   node --inspect-brk dist/index.js
   ```

2. **Enable debug logging:**
   ```bash
   DEBUG=* pnpm dev:https
   ```

3. **Use GraphQL Playground:**
   - Test queries and mutations
   - Inspect network requests
   - Check response times

### Performance Monitoring

1. **Database query monitoring:**
   ```bash
   DEBUG=prisma:query pnpm dev:https
   ```

2. **Memory usage monitoring:**
   ```bash
   node --inspect pnpm dev:https
   # Open chrome://inspect
   ```

3. **Request tracing:**
   ```typescript
   // Add request timing middleware
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       logger.info('Request completed', {
         method: req.method,
         url: req.url,
         duration,
         status: res.statusCode
       });
     });
     next();
   });
   ```

## Deployment Preparation

### Pre-deployment Checklist

- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Documentation updated

### Build Process

```bash
# Clean build
rm -rf dist/
pnpm build

# Test production build
NODE_ENV=production node dist/index.js

# Run production tests
NODE_ENV=production pnpm test
```

## Related Documentation

- [Setup Guide](./SETUP.md) - Initial environment setup
- [Architecture Guide](./ARCHITECTURE.md) - System design overview
- [Testing Guide](./TESTING.md) - Testing strategy and execution
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
