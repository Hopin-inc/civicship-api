# Implementation Patterns and Best Practices

This document describes important implementation patterns, architectural patterns, and best practices used in the civicship-api project.

## Architectural Pattern

### Domain Structure Pattern

Follow an Established Domain Pattern:

```
src/application/domain/your-domain/
├── controller/
│ ├── resolver.ts # GraphQL resolver
│ └── dataloader.ts # Data Loading Optimization
├── usecase.ts # Business Logic Control
├── service.ts # Core Domain Operations
├── data/
│ ├── repository.ts # Data Access Implementation
│ ├── interface.ts # Repository Contract
│ ├── converter.ts # Data Conversion
│ └── type.ts # Domain Types
├── schema/ # GraphQL Schema File
└── presenter.ts # Response Formatting
```

### Dependency Injection Pattern

``` typescript
// src/application/provider.ts
import { container } from "tsyringe";

// Registering the service
container.registerSingleton<IUserRepository>(
"UserRepository",
UserRepository
);

container.registerSingleton<UserService>(
"UserService",
UserService
);

// Usage example
@injectable()
export class UserService {
constructor(
@inject("UserRepository") private userRepository: IUserRepository
) {}
}
```

## Performance optimization patterns

### DataLoader pattern

Implementing DataLoader to solve the N+1 query problem:

``` typescript
// src/application/domain/your-domain/controller/dataloader.ts
import DataLoader from 'dataloader';

export const createUserDataLoader = (context: IContext) => {
return new DataLoader<string, User>(async (userIds) => {
const users = await context.prisma.user.findMany({
where: { id: { in: userIds as string[] } }
});

// Map IDs while preserving their order
return userIds.map(id =>
users.find(user => user.id === id) || null
);
});
};

// Use with GraphQL resolver
export const communityResolver = {
Community: {
members: async (community, args, context) => {
const membershipIds = await context.dataloaders.communityMemberships
.load(community.id);
return context.dataloaders.user.loadMany(membershipIds);
}
}
};
```

### Database Optimization Patterns

1. **Efficiently Retrieving Related Data**
```typescript
// Include Related Data in a Single Query
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

2. **Leveraging Indexes**
```prisma
model User {
id String @id
email String @unique

@@index([email])
@@index([createdAt])
}
```

3. **Using Materialized Views**
```sql
-- Views for Performance Optimization
CREATE MATERIALIZED VIEW mv_current_points AS
SELECT
wallet_id,
SUM(amount) as current_balance
FROM transactions
GROUP BY wallet_id;
```

## Security Patterns

### Row-Level Security (RLS) Pattern

```typescript
// src/infrastructure/prisma/client.ts
export class PrismaClientIssuer {
// Accessible only to community members
   onlyBelongingCommunity(userId: string, communityId: string) {
      return this.prisma.$extends({
         query: {
            $allModels: {
               async $allOperations({ args, query }) {
// Apply RLS rules
                  return query({
                     ...args,
                     where: {
                        ...args.where,
                        community: {
                           memberships: {
                              some: { userId, status: 'JOINED' }
                           }
                        }
                     }
                  });
               }
            }
         }
      });
   }
}
```

### GraphQL Authorization Pattern

```typescript
// src/presentation/graphql/rule.ts
import { rule, shield, and, or } from 'graphql-shield';

const isAuthenticated = rule({ cache: 'contextual' })( 
async (parent, args, context) => { 
return context.currentUser !== null; 
}
);

const isCommunityOwner = rule({ cache: 'strict' })( 
async (parent, args, context) => { 
const membership = await context.prisma.membership.findFirst({ 
where: { 
userId: context.currentUser.id, 
communityId: args.communityId, 
role: 'OWNER' 
} 
}); 
return !!membership; 
}
);

export const permissions = shield({
Query: {
community: isAuthenticated,
},
Mutation: {
updateCommunity: and(isAuthenticated, isCommunityOwner),
}
});
```

## Error Handling Pattern

### Service Layer Error Handling

``` typescript
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

### GraphQL Resolver Error Handling

``` typescript
export const userResolver = {
Mutation: {
createUser: async (parent, args, context) => {
try {
return await context.services.user.createUser(args.input);
} catch (error) {
// Delegate to GraphQL error handling middleware
throw error;
}
}
}
}
};
```

## Logging Pattern

### Structured Logging

``` typescript
import { logger } from '../infrastructure/logger';

// Different Log Levels
logger.debug('Debug information', { userId, action });
logger.info('User created successfully', { userId });
logger.warn('Deprecated API used', { endpoint });
logger.error('Database connection failed', { error });
```

### Production Logging Best Practices

- **Avoid logging sensitive data** (passwords, tokens)
- **Use structured logs with consistent fields**
- **Include a correlation ID for request tracking**
- **Log performance metrics for monitoring**

### Request Tracing Pattern

``` typescript
// Request Timing Middleware
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

## GraphQL Optimization Pattern

### Field-Level Caching

``` typescript
const resolvers = {
User: {
communities: async (user, args, context) => {
return context.dataloaders.userCommunities.load(user.id);
}
}
};
```

### Query Complexity Analysis

``` typescript
const server = new ApolloServer({
typeDefs,
resolvers,
plugins: [
depthLimit(10),
costAnalysis({ maximumCost: 1000 })
]
});
```

## Naming Convention Pattern

### Files and Directories

- **File:** kebab-case (`user-service.ts`)
- **Directory:** kebab-case (`user-management/`)
- **Test Files:** `*.test.ts` or `*.spec.ts`

### Code Elements

- **Variables/Functions:** camelCase (`getUserById`)
- **Class:** PascalCase (`UserService`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interface:** 'I'-Prefixed PascalCase (`IUserRepository`)
- **Type:** PascalCase (`UserCreateInput`)

### GraphQL Schema

- **Type:** PascalCase (`User`, `Community`)
- **Fields:** camelCase (`firstName`, `createdAt`)
- **Enumeration:** UPPER_SNAKE_CASE (`USER_ROLE`)
- **Input Type:** Suffixed PascalCase (`CreateUserInput`)

## Authentication and Authorization Patterns

### Firebase Authentication Integration

``` typescript
// Verify Firebase Authentication
const verifyFirebaseToken = async (token: string) => {
try {
const decodedToken = await admin.auth().verifyIdToken(token);
return decodedToken;
} catch (error) {
throw new AuthenticationError('Invalid token');
}
};
```

### Multi-tenant authentication

``` typescript
// Tenant-specific authentication
const verifyTenantToken = async (token: string, tenantId: string) => {
const auth = admin.auth().tenantManager().authForTenant(tenantId);
return await auth.verifyIdToken(token);
};
```

## Data conversion pattern

### GraphQL ↔ Prisma conversion

``` typescript
// src/application/domain/user/data/converter.ts
export class UserConverter {
static toGraphQL(prismaUser: PrismaUser): GraphQLUser {
return {
id: prismaUser.id,
name: prismaUser.name,
email: prismaUser.email,
createdAt: prismaUser.createdAt.toISOString()
};
}

static toPrisma(graphqlInput: CreateUserInput): PrismaUserCreateInput {
return {
name: graphqlInput.name,
email: graphqlInput.email,
// GraphQL to Prisma conversion logic
};
}
}
```

## Monitoring and Debugging Patterns

### Performance Monitoring

``` typescript
// Database Query Monitoring
const queryMiddleware = async (params, next) => {
const start = Date.now();
const result = await next(params);
const duration = Date.now() - start;

if (duration > 1000) {
logger.warn('Slow query detected', {
model: params.model,
action: params.action,
duration
});
}

return result;
};
```

### Memory Usage Monitoring

``` bash
# Monitor Memory Usage
node --inspect pnpm dev:https
# Open chrome://inspect
```

## Security Best Practices

### Authentication

- **Always validate JWT tokens**
- **Check token expiration**
- **Validate token issuer**
- **Gracefully handle token refreshes**

### Authorization

- **Implement role-based access control**
- **Use GraphQL shield for declarative rules**
- **Apply row-level security**
- **Verify user permissions at multiple layers**

### Data Protection

- **Do not log sensitive data**
- **Sanitize user input**
- **Use parameterized queries**
- **Implement rate limiting**

### API Security

- **Validate all input**
- **Implement CORS properly**
- **Use HTTPS in production**
- **Monitor for suspicious activity**

## Related Documentation

- [Development Workflow](./DEVELOPMENT.md) - Daily development procedures
- [Testing Guide](../TESTING.md) - Testing strategy and execution
- [Command Reference](./COMMANDS.md) - Complete command list
- [Architecture Guide](./ARCHITECTURE.md) - System design overview