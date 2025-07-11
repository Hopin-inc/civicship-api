# Architecture Guide

This guide provides a comprehensive overview of the civicship-api system architecture, design patterns, and implementation principles.

## Overview

Civicship API follows **Domain-Driven Design (DDD)** and **Clean Architecture** principles with clear separation of concerns across three main layers. The system is designed to support community engagement platforms with integrated point-based rewards and LINE messaging integration.

## Architectural Principles

### 1. Domain-Driven Design (DDD)
- **Domain-centric approach:** Business logic organized around core domains
- **Ubiquitous language:** Consistent terminology across code and documentation
- **Bounded contexts:** Clear boundaries between different business areas
- **Domain services:** Encapsulation of domain-specific operations

### 2. Clean Architecture
- **Dependency inversion:** High-level modules don't depend on low-level modules
- **Layer separation:** Clear boundaries between presentation, application, and infrastructure
- **Testability:** Easy to test business logic in isolation
- **Framework independence:** Business logic independent of external frameworks

### 3. SOLID Principles
- **Single Responsibility:** Each class has one reason to change
- **Open/Closed:** Open for extension, closed for modification
- **Liskov Substitution:** Subtypes must be substitutable for base types
- **Interface Segregation:** Clients shouldn't depend on unused interfaces
- **Dependency Inversion:** Depend on abstractions, not concretions

## Layer Architecture

### 1. Application Layer (`src/application/`)

**Purpose:** Business logic and domain operations

```
application/
├── domain/              # Domain-specific business logic
│   ├── account/        # User & community management
│   │   ├── user/       # User profiles, authentication
│   │   ├── community/  # Community creation, management
│   │   ├── membership/ # User-community relationships
│   │   ├── wallet/     # Point-based wallet system
│   │   └── identity/   # Multi-platform identity management
│   ├── experience/     # Opportunities & participation
│   │   ├── opportunity/    # Event/activity creation
│   │   ├── reservation/    # Booking system
│   │   ├── participation/  # Attendance tracking
│   │   └── evaluation/     # Post-participation assessment
│   ├── content/        # Content management
│   │   ├── article/    # Community articles
│   │   └── image/      # Media upload & storage
│   ├── reward/         # Incentive system
│   │   ├── utility/    # Redeemable benefits
│   │   └── ticket/     # Point-based tickets
│   ├── transaction/    # Point transfers & financial operations
│   ├── notification/   # LINE messaging & rich menus
│   └── location/       # Geographic data management
├── provider.ts         # Dependency injection configuration
└── utils.ts           # Shared utilities
```

**Key Characteristics:**
- Contains pure business logic
- Independent of external frameworks
- Defines interfaces for infrastructure dependencies
- Implements use cases and domain services

### 2. Infrastructure Layer (`src/infrastructure/`)

**Purpose:** External systems integration and data persistence

```
infrastructure/
├── prisma/             # Database layer
│   ├── schema.prisma  # Database schema definition
│   ├── migrations/    # Database version control
│   ├── seeds/         # Initial data population
│   │   ├── index.ts   # Seeding orchestration
│   │   ├── master/    # Master data (cities, states)
│   │   └── domain/    # Business data (users, communities)
│   ├── factories/     # Test data generation
│   └── client.ts      # Prisma client configuration
└── libs/              # External service integrations
    ├── firebase.ts    # Firebase Authentication
    ├── storage.ts     # Google Cloud Storage
    └── did.ts         # Decentralized Identity (IDENTUS)
```

**Key Characteristics:**
- Implements infrastructure interfaces defined in application layer
- Handles external API integrations
- Manages data persistence and retrieval
- Contains framework-specific code

### 3. Presentation Layer (`src/presentation/`)

**Purpose:** API endpoints and request/response handling

```
presentation/
├── graphql/           # GraphQL API
│   ├── schema/       # GraphQL schema definitions
│   ├── resolver/     # Query/Mutation resolvers
│   ├── dataloader/   # Performance optimization
│   ├── rule.ts       # Authorization rules
│   └── server.ts     # Apollo Server configuration
├── middleware/       # Request processing
│   ├── auth.ts      # Authentication & context creation
│   ├── cors.ts      # Cross-origin resource sharing
│   └── logger.ts    # Request logging
└── router/          # REST endpoints
    └── line-webhook.ts  # LINE messaging webhooks
```

**Key Characteristics:**
- Handles HTTP requests and responses
- Implements GraphQL resolvers
- Manages authentication and authorization
- Provides REST endpoints for webhooks

## Domain Structure Pattern

Each domain follows a consistent layered structure that promotes maintainability and testability:

```
domain/
├── controller/
│   ├── resolver.ts      # GraphQL API endpoints
│   └── dataloader.ts    # Efficient data loading (N+1 prevention)
├── usecase.ts          # Business logic orchestration
├── service.ts          # Core domain operations
├── data/
│   ├── repository.ts   # Data access implementation
│   ├── interface.ts    # Repository contracts
│   ├── converter.ts    # GraphQL ↔ Prisma data transformation
│   └── type.ts         # Domain-specific types
├── schema/             # GraphQL schema definitions
└── presenter.ts        # Response formatting
```

### Layer Responsibilities

#### Controller Layer
- **resolver.ts:** GraphQL query/mutation handlers
- **dataloader.ts:** Batch data loading for performance optimization

#### Use Case Layer
- **usecase.ts:** Orchestrates business operations
- Coordinates between services and repositories
- Implements authorization checks
- Manages transaction boundaries

#### Service Layer
- **service.ts:** Core domain business logic
- Implements domain rules and validations
- Handles complex business operations
- Independent of data access concerns

#### Data Layer
- **repository.ts:** Data access implementation
- **interface.ts:** Repository contracts (dependency inversion)
- **converter.ts:** Data transformation between layers
- **type.ts:** Domain-specific type definitions

## Key Architectural Patterns

### 1. DataLoader Pattern

**Purpose:** Prevent N+1 query problems in GraphQL

**Implementation:**
```typescript
// Example: src/application/domain/account/user/controller/dataloader.ts
export const userLoader = new DataLoader<string, User>(
  async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });
    return userIds.map(id => users.find(user => user.id === id));
  }
);
```

**Benefits:**
- Batches multiple database queries into single requests
- Caches results within single request lifecycle
- Significantly improves GraphQL query performance

### 2. Dependency Injection (tsyringe)

**Purpose:** Clean dependency management and testability

**Implementation:**
```typescript
// Example: src/application/domain/account/user/service.ts
@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private userRepo: IUserRepository
  ) {}
}
```

**Benefits:**
- Loose coupling between components
- Easy to mock dependencies for testing
- Centralized dependency configuration
- Supports interface-based programming

### 3. Row-Level Security (PrismaClientIssuer)

**Purpose:** Data isolation based on user permissions

**Implementation:**
```typescript
// Example: Automatic filtering based on user context
const issuer = new PrismaClientIssuer();
const communities = await issuer.community.findMany(); // Auto-filtered by user access
```

**Benefits:**
- Automatic data filtering based on user context
- Prevents unauthorized data access
- Simplifies authorization logic
- Consistent security across all queries

### 4. Authorization Rules

**Purpose:** GraphQL-level permission checking

**Implementation:**
```typescript
// Example: src/presentation/graphql/rule.ts
export const IsUser = rule({ cache: "contextual" })(
  async (parent, args, context) => {
    return !!context.currentUser;
  }
);

export const IsCommunityOwner = rule({ cache: "contextual" })(
  async (parent, args, context) => {
    const membership = await context.dataloaders.membership.load({
      userId: context.currentUser.id,
      communityId: args.communityId
    });
    return membership?.role === "OWNER";
  }
);
```

**Benefits:**
- Declarative authorization rules
- Composable permission checks
- Caching for performance
- Clear separation of concerns

## Database Architecture

### Schema Organization

The database schema is organized around core business entities:

#### User Management
- **Users:** Individual user profiles and authentication
- **Communities:** Organizations that host opportunities
- **Memberships:** User-community relationships with roles
- **Identities:** Multi-platform authentication (LINE, Firebase, Phone)

#### Experience System
- **Opportunities:** Events, activities, or volunteering opportunities
- **OpportunitySlots:** Specific time slots with capacity limits
- **Reservations:** User bookings for opportunity slots
- **Participations:** Actual participation tracking and status

#### Reward System
- **Wallets:** Point containers (community or member-owned)
- **Transactions:** Point transfers between wallets
- **Utilities:** Redeemable benefits offered by communities
- **Tickets:** Point-based tickets for utility redemption

#### Content Management
- **Articles:** Community-published content
- **Images:** Media files with GCS integration
- **Places:** Geographic locations for opportunities

#### Notification System
- **Community Configs:** LINE channel and LIFF configurations
- **Rich Menus:** Role-based LINE interface customization

### Performance Optimizations

#### Materialized Views
```sql
-- Current point balances (updated via triggers)
CREATE MATERIALIZED VIEW mv_current_points AS
SELECT wallet_id, SUM(point_change) as current_point
FROM t_transactions
GROUP BY wallet_id;

-- Accumulated point totals
CREATE MATERIALIZED VIEW mv_accumulated_points AS
SELECT wallet_id, SUM(CASE WHEN point_change > 0 THEN point_change ELSE 0 END) as accumulated_point
FROM t_transactions
GROUP BY wallet_id;
```

#### Database Indexes
- Optimized for common query patterns
- Composite indexes for complex filters
- Partial indexes for conditional queries
- Foreign key indexes for join performance

#### Connection Pooling
- Prisma connection management
- Configurable pool size based on environment
- Connection lifecycle monitoring

### Query Optimization

#### DataLoader Pattern Implementation
- Batches N+1 queries into single database calls
- Implements per-request caching
- Reduces database load significantly

#### Efficient Pagination
```typescript
// Cursor-based pagination for large datasets
const opportunities = await prisma.opportunity.findMany({
  take: limit,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
});
```

## Security Architecture

### Authentication Flow

1. **Token Validation** → `presentation/middleware/auth.ts`
   - Firebase JWT token verification
   - Multi-tenant support for communities
   - Token expiration and refresh handling

2. **User Context Creation** → Database user lookup
   - Load user profile and permissions
   - Create request context with user data
   - Initialize data loaders for request

3. **Permission Assignment** → Role-based permissions
   - Community-specific role assignment
   - System-level admin permissions
   - Context-aware permission checking

4. **Request Context** → Available throughout request lifecycle
   - Current user information
   - Permission flags
   - Database issuer for RLS
   - Data loaders for performance

### Authorization Layers

#### 1. GraphQL Rules (Pre/Post-execution)
```typescript
// Pre-execution permission checks
export const permissions = shield({
  Query: {
    communities: IsUser,
    adminUsers: IsSystemAdmin,
  },
  Mutation: {
    createCommunity: IsUser,
    updateCommunity: IsCommunityOwner,
  }
});
```

#### 2. Row-Level Security (Database-level)
```typescript
// Automatic data filtering based on user context
const issuer = new PrismaClientIssuer(context.currentUser);
const communities = await issuer.community.findMany(); // Only accessible communities
```

#### 3. Business Logic (Domain-specific)
```typescript
// Domain-specific access controls
export class CommunityService {
  async updateCommunity(id: string, data: UpdateCommunityInput) {
    // Check if user has permission to update this community
    await this.validateUpdatePermission(id);
    return this.repository.update(id, data);
  }
}
```

#### 4. API Key Authentication (Admin endpoints)
```typescript
// Admin endpoint protection
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.CIVICSHIP_ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
```

## Testing Architecture

### Test Organization

```
__tests__/
├── unit/              # Individual function tests
│   ├── services/     # Business logic tests
│   ├── repositories/ # Data access tests
│   └── utils/        # Utility function tests
├── integration/       # Database integration tests
│   ├── graphql/      # GraphQL resolver tests
│   ├── auth/         # Authentication flow tests
│   └── database/     # Database operation tests
├── e2e/              # End-to-end API tests
│   ├── user-flows/   # Complete user journey tests
│   └── admin-flows/  # Admin operation tests
└── fixtures/         # Test data and utilities
    ├── factories/    # Test data generation
    └── helpers/      # Test utility functions
```

### Testing Patterns

#### Factory Pattern (Test Data Generation)
```typescript
// Example: User factory for consistent test data
export const createUser = (overrides?: Partial<User>): User => ({
  id: faker.datatype.uuid(),
  name: faker.name.fullName(),
  email: faker.internet.email(),
  createdAt: new Date(),
  ...overrides
});
```

#### Repository Mocking (Unit Test Isolation)
```typescript
// Example: Mock repository for service testing
const mockUserRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};
```

#### Database Transactions (Test Data Cleanup)
```typescript
// Example: Automatic test data cleanup
beforeEach(async () => {
  await prisma.$transaction(async (tx) => {
    // Test setup with transaction
  });
});

afterEach(async () => {
  await prisma.$transaction(async (tx) => {
    // Cleanup test data
  });
});
```

#### GraphQL Testing (End-to-end API Validation)
```typescript
// Example: GraphQL mutation testing
const CREATE_COMMUNITY = gql`
  mutation CreateCommunity($input: CreateCommunityInput!) {
    createCommunity(input: $input) {
      id
      name
      pointName
    }
  }
`;

test('should create community', async () => {
  const result = await client.mutate({
    mutation: CREATE_COMMUNITY,
    variables: { input: { name: 'Test Community' } }
  });
  expect(result.data.createCommunity).toBeDefined();
});
```

## Deployment Architecture

### Multi-Service Deployment

The application supports multiple deployment configurations:

#### 1. Internal API (Main Service)
- **Entry Point:** `src/index.ts`
- **Purpose:** Main GraphQL API server
- **Dockerfile:** `Dockerfile`
- **Deployment:** Google Cloud Run

#### 2. External API (Public Wallet Operations)
- **Entry Point:** `src/external-api.ts`
- **Purpose:** Public wallet operations and external integrations
- **Dockerfile:** `Dockerfile.external`
- **Deployment:** Google Cloud Run (separate service)

#### 3. Batch Processing (Background Jobs)
- **Entry Point:** `src/batch.ts`
- **Purpose:** Background job processing
- **Dockerfile:** `Dockerfile.batch`
- **Deployment:** Google Cloud Run Jobs

### Infrastructure Components

#### Google Cloud Run
- **Auto-scaling:** Based on request volume
- **Container Registry:** Artifact Registry for Docker images
- **Environment Variables:** Managed through Cloud Run configuration
- **Health Checks:** Built-in health monitoring

#### Database Access
- **SSH Tunnel:** Secure database access through jumpbox during builds
- **Connection Pooling:** Prisma connection management
- **SSL/TLS:** Encrypted database connections

#### CI/CD Pipeline
- **GitHub Actions:** Automated build and deployment
- **Multi-environment:** Separate dev/staging/prod deployments
- **Security Scanning:** Container vulnerability scanning
- **Automated Testing:** Unit, integration, and E2E tests

## Performance Considerations

### Query Optimization
- **DataLoader Pattern:** Batch and cache database queries
- **Materialized Views:** Pre-computed aggregations
- **Database Indexes:** Optimized for common query patterns
- **Connection Pooling:** Efficient database connection management

### Caching Strategy
- **Request-level Caching:** DataLoader caches within single request
- **Application-level Caching:** Redis for session and temporary data
- **Database-level Caching:** PostgreSQL query result caching
- **CDN Caching:** Static asset delivery through GCS

### Monitoring and Observability
- **Application Metrics:** Custom metrics for business operations
- **Database Monitoring:** Query performance and connection metrics
- **Error Tracking:** Comprehensive error logging and alerting
- **Performance Monitoring:** Request latency and throughput tracking

## Related Documentation

- [Domain Details](./DOMAINS.md) - Detailed domain structure and business logic
- [Implementation Patterns](./PATTERNS.md) - Code patterns and best practices
- [Setup Guide](./SETUP.md) - Development environment setup
- [Development Workflow](./DEVELOPMENT.md) - Daily development procedures
- [Testing Guide](./TESTING.md) - Testing strategy and execution
