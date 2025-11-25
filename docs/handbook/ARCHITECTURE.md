# Architecture Guide

This guide describes the architecture, design patterns, and implementation principles of the civicship-api system.

## Overview

The civicship API follows the principles of **Domain-Driven Design (DDD)** and **Clean Architecture**, maintaining a clear separation of concerns across three major layers.

## Architecture Principles

### 1. Domain-Driven Design (DDD)
- **Domain-Centric Approach**: Organizing business logic around the core domain
- **Bounded Context**: Clear boundaries between different business areas
- **Domain Services**: Encapsulating domain-specific operations

### 2. Clean Architecture
- **Dependency Inversion**: High-level modules do not depend on low-level modules
- **Layer Separation**: Clear boundaries between presentation, application, and infrastructure
- **Testability**: Business logic is easy to test independently
- **Framework Independence**: Business logic that does not depend on external frameworks

## Layered Architecture

### 1. Application Layer (`src/application/`)

**Purpose**: Business logic and domain operations

```
application/
├── domain/ # Domain-specific business logic
│ ├── account/ # User and community management (8 subdomains)
│ │ ├── auth/ # Authentication and LIFF integration
│ │ ├── community/ # Community creation, management, and configuration
│ │ ├── identity/ # Multi-platform authentication management
│ │ ├── membership/ # User-community relationship and role management
│ │ ├── nft-wallet/ # NFT wallet functionality
│ │ ├── user/ # User profile and authentication
│ │ └── wallet/ # Points-based wallet system
│ ├── experience/ # Opportunity and participation management
│ │ ├── opportunity/ # Event and activity creation
│ │ ├── reservation/ # Reservation system
│ │ ├── participation/ # Attendance tracking
│ │ └── evaluation/ # Post-participation evaluation
│ ├── content/ # Content management
│ │ ├── article/ # Community articles
│ │ └── image/ # Media upload and storage
│ ├── reward/ # Incentive system
│ │ ├── utility/ # Redeemable benefits
│ │ └── ticket/ # Points-based tickets
│ ├── transaction/ # Points transfers
│ ├── notification/ # Notifications
│ └── location/ # Geographical information
├── provider.ts # Dependency injection
└── utils.ts # Shared functions
```

**Key Features**
- Contains pure business logic
- Independent from external frameworks
- Defines interfaces for infrastructure dependencies
- Implements use cases and domain services

### 2. Infrastructure Layer (`src/infrastructure/`)

**Purpose** External system integration and data persistence

```
infrastructure/
├── prisma/ # Database layer
│ ├── schema.prisma # Database schema definition
│ ├── migrations/ # Database versioning
│ ├── seeds/ # Initial data population
│ │ ├── index.ts # Seeding orchestration
│ │ ├── master.ts # Master data (city, state)
│ │ └── domain.ts # Business data (users, communities)
│ ├── factories/ # Test data generation
│ └── client.ts # Prisma client configuration
└── libs/ # External service integration
├── firebase.ts # Firebase authentication
├── storage.ts # Google Cloud Storage
└── did.ts # Decentralized identity (IDENTUS)
```

**Key Features**
- Implements infrastructure interfaces defined in the application layer
- Handles external API integration
- Manages data persistence and retrieval
- Contains framework-specific code

### 3. Presentation Layer (`src/presentation/`)

**Purpose** API endpoints and request/response handling

```
presentation/
├── graphql/
│ ├── schema/ # GraphQL schema definition
│ ├── resolver/ # Query and mutation resolver
│ ├── dataloader/ # Performance optimization
│ ├── rule.ts # Authorization rules
│ └── server.ts # Apollo Server configuration
├── middleware/
│ ├── auth.ts # Authentication and context creation
│ ├── cors.ts # Cross-origin resource sharing
│ └── logger.ts # Request logging
└── router/ # REST endpoint
└── line.ts # LINE Webhook
```

**Key Features**
- Handles HTTP requests and responses
- Implements a GraphQL resolver
- Manages authentication and authorization
- Provides a REST endpoint for webhooks

## Domain Structure Pattern

Each domain follows a consistent layer structure that promotes maintainability and testability:

```
domain/
├── controller/
│ ├── resolver.ts # GraphQL API endpoint
│ └── dataloader.ts # Efficient data loading (prevents N+1 issues)
├── usecase.ts # Business logic orchestration
├── service.ts # Core domain operations
├── data/
│ ├── repository.ts # Data access implementation
│ ├── interface.ts # Repository contract
│ ├── converter.ts # GraphQL ↔ Prisma data conversion
│ └── type.ts # Domain-specific types
├── schema/ # GraphQL schema definition
└── presenter.ts # Response formatting
```

### Layer responsibilities

#### Controller layer
- **resolver.ts:** GraphQL query and mutation handler
- **dataloader.ts:** Batch data loading for performance optimization

#### Use Case Layer
- **usecase.ts:** Orchestration of business operations
- Coordination between services and repositories
- Authorization check implementation
- Transaction boundary management

#### Service Layer
- **service.ts:** Core domain business logic
- Implementation of domain rules and validations
- Handling complex business operations
- Independence from data access concerns

#### Data Layer
- **repository.ts:** Data access implementation
- **interface.ts:** Repository contract (dependency inversion)
- **converter.ts:** Data conversion between layers
- **type.ts:** Domain-specific type definitions

## Key Architectural Patterns

### 1. DataLoader Pattern

**Purpose:** Preventing the N+1 query problem in GraphQL
**Package:** `dataloader@2.2.3`

**Implementation Example:**
```typescript
// Actual Implementation: src/application/domain/account/user/controller/dataloader.ts
export const createUserDataLoader = (issuer: PrismaClientIssuer) => {
return new DataLoader<string, PrismaUser | null>(
async (userIds: readonly string[]) => {
const users = await issuer.internal((tx) =>
tx.user.findMany({
where: { id: { in: [...userIds] } },
}),
);
return userIds.map(id => users.find(user => user.id === id) || null);
},
);
};

// Implementing a DataLoader for a wallet
export const createMemberWalletDataLoader = (issuer: PrismaClientIssuer) => {
return new DataLoader<string, PrismaWallet | null>(
async (userIds: readonly string[]) => {
return issuer.internal((tx) =>
tx.wallet.findMany({
where: { userId: { in: [...userIds] } },
include: { currentPointView: true },
}),
);
},
);
};
```

Benefits:
- Batching multiple database queries into a single request
- Caching results within a single request lifecycle
- Significantly improving GraphQL query performance

### 2. Dependency Injection (tsyringe)

Purpose: Clean dependency management and testability
**Package:** `tsyringe@4.10.0`
**Configuration file:** `src/application/provider.ts` (275 lines of comprehensive DI configuration)

**Implementation:**
```typescript
// Actual DI configuration: src/application/provider.ts
export function registerProductionDependencies() {
// Infrastructure
container.register("prismaClient", { useValue: prismaClient });
container.register("PrismaClientIssuer", { useClass: PrismaClientIssuer });

// Register services and repositories for all 7 domains
// Account Domain
container.register("UserService", { useClass: UserService });
container.register("UserRepository", { useClass: UserRepository });
container.register("CommunityService", { useClass: CommunityService });
container.register("CommunityRepository", { useClass: CommunityRepository });
// ... Register other domains in the same way.
}

// Service Implementation Example
@injectable()
export class UserService {
constructor(
@inject("UserRepository") private userRepo: IUserRepository,
@inject("PrismaClientIssuer") private issuer: PrismaClientIssuer
) {}
}
```

**Advantages**
- Loose coupling between components
- Easy dependency mocking for testing
- Centralized dependency configuration
- Supports interface-based programming

### 3. RLS (PrismaClientIssuer)

**Purpose** Data isolation based on user permissions
**Implementation file:** `src/infrastructure/prisma/client.ts`

**Implementation:**
``` typescript
// Actual RLS implementation
export class PrismaClientIssuer {
public async onlyBelongingCommunity<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> { 
if (ctx.isAdmin) { 
return this.public(ctx, callback); 
} 

const user = ctx.currentUser; 
if (user) { 
return await this.client.$transaction(async (tx) => { 
await this.setRls(tx); 
await this.setRlsConfigUserId(tx, user.id); 
return await callback(tx); 
}); 
} 
throw new AuthorizationError("Not authenticated"); 
} 

private async setRlsConfigUserId(tx: Transaction, userId: string | null) { 
const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>( 
`SELECT set_config('app.rls_config.user_id', '${userId ?? ""}', FALSE) as value;`,
);
return value;
}

/ Admin Bypass
public async admin<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
return await this.client.$transaction(async (tx) => {
await this.setRlsBypass(tx, true);
return await callback(tx);
});
}
}

// Usage Example: Automatic filtering based on user context
const issuer = new PrismaClientIssuer();
const communities = await issuer.onlyBelongingCommunity((tx) =>
tx.community.findMany()
); // Automatic filtering based on user access
```

**Benefits**
- Automatic data filtering based on user context
- Prevention of unauthorized data access
- Simplified authorization logic
- Consistent security across all queries

### 4. Authorization Rule

**Purpose** Permission check at the GraphQL level
**Package:** `@graphql-authz/core@1.3.2`
**Implementation file:** `src/presentation/graphql/rule.ts`

**Implementation:**
```typescript
// Actual authorization rule implementation
const IsUser = preExecRule({
error: new AuthenticationError("User must be logged in"),
})((context: IContext) => {
if (context.isAdmin) return true;
return !!context.currentUser;
});

const IsCommunityOwner = preExecRule({
error: new AuthorizationError("User must be community owner"),
})((context: IContext, args: { permission?: { communityId?: string } }) => {
if (context.isAdmin) return true;

const user = context.currentUser;
const permission = args.permission;

if (!user || !permission?.communityId) return false;

const membership = context.hasPermissions?.memberships?.find(
(m) => m.communityId === permission.communityId,
);

return membership?.role === Role.OWNER;
});

// Available Authorization Rules
export const rules = {
IsUser, // Logged-in User
IsAdmin, // System Administrator
IsSelf, // Self Actions
IsCommunityOwner, // Community Owner
IsCommunityManager, // Community Manager
IsCommunityMember, // Community Member
IsOpportunityOwner, // Opportunity Creator
CanReadPhoneNumber, // Permission to Read Phone Number
} as const;
```

**Advantages**
- Declarative Authorization Rules
- Combinable Permission Checks
- Caching for Improved Performance
- Clear separation of concerns

## Database Architecture

### Schema Structure

The database schema is organized around core business entities:

#### User Management
- **Users:** Individual user profiles and authentication
- **Communities:** Organizations hosting opportunities
- **Memberships:** User-community relationships with roles (OWNER, MANAGER, MEMBER)
- **Identities:** Multi-platform authentication (LINE, Firebase, phone)
- **Wallets:** Points-based wallet system (COMMUNITY, MEMBER)
- **NFT Wallets:** NFT functionality integration

#### Experience System
- **Opportunities:** Events, activities, and volunteer opportunities
- **OpportunitySlots:** Event slots
- **Reservations:** Reservations for event slots
- **Participations:** Actual activities

#### Reward System
- **Transactions:** Transferring points between wallets
- **Utilities:** Redeemable rewards provided by the community
- **Tickets:** Point-based tickets for utility redemption

#### Content Management
- **Articles:** Community-published content
- **Images:** GCS-integrated media files
- **Places:** Geographic locations of recruitment

#### Infrastructure System
- **Community Configs:** LINE channel and LIFF settings

### Performance Optimization

#### Materialized Views and Views
**Implemented Views (defined in the Prisma schema):**

**Point-related Views:**
- `CurrentPointView` (`mv_current_points`) - Current point balance
- `AccumulatedPointView` (`mv_accumulated_points`) - Accumulated point total

**Place-related Views:**
- `PlacePublicOpportunityCountView` - Number of public opportunities by location
- `PlaceAccumulatedParticipantsView` - Cumulative Participants by Location

**Membership-Related Views:**
- `MembershipParticipationGeoView` - Membership participation geographic information
- `MembershipParticipationCountView` - Membership participation count statistics
- `MembershipHostedOpportunityCountView` - Hosted opportunity count statistics

**Opportunity-Related Views:**
- `EarliestReservableSlotView` - Earliest reservable slot
- `OpportunityAccumulatedParticipantsView` - Cumulative participants by opportunity
- `SlotRemainingCapacityView` - Slot remaining capacity calculation

```sql
-- Refresh materialized view (implemented)
-- src/infrastructure/prisma/sql/refreshMaterializedViewCurrentPoints.sql
REFRESH MATERIALIZED VIEW CONCURRENTLY "mv_current_points";
```

#### Database Indexes
- Optimized for common query patterns
- Composite indexes for complex filters
- Partial indexes for conditional queries
- Foreign key indexes for join performance

#### Connection Pooling
- Prisma Connection Management
- Configurable pool size based on environment
- Connection lifecycle monitoring

### Query Optimization

#### DataLoader Pattern Implementation
- Batching N+1 queries into a single database call
- Per-request caching implementation
- Significantly reduced database load

#### Efficient Pagination
``` typescript
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

1. **Token Verification** → `presentation/middleware/auth.ts`
- Firebase JWT token validation
- Multi-tenant support for communities
- Token expiration and renewal handling

2. **User context creation** → Database user lookup
- Loading user profile and permissions
- Creating a request context with user data
- Initializing a data loader for the request

3. **Permission assignment** → Role-based permissions
- Community-specific role assignment
- System-level administrator permissions
- Context-aware permission checks

4. **Request context** → Available throughout the request lifecycle
- Current user information
- Permission flags
- Database issuer for RLS
- Performance data loader

### Authorization layer

#### 1. GraphQL rules (pre- and post-execution)
``` typescript
// Pre-execution permission check
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

#### 2. RLS (Database Level)
``` typescript
// Automatic data filtering based on user context
const issuer = new PrismaClientIssuer(context.currentUser);
const communities = await issuer.onlyBelongingCommunity.community.findMany(); // Only accessible communities
```

#### 3. Business Logic (Domain-Specific)
``` typescript
// Domain-Specific Access Control
export class CommunityService {
async updateCommunity(id: string, data: UpdateCommunityInput) {
/ // Check if the user has permission to update this community
await this.validateUpdatePermission(id);
return this.repository.update(id, data);
}
}
```

#### 4. API Key Authentication (Admin Endpoint)
``` typescript
// Admin Endpoint Protection
export const adminAuth = (req: Request, res: Response, next: NextFunction) => { 
const apiKey = req.headers['x-api-key']; 
if (apiKey !== process.env.CIVICSHIP_ADMIN_API_KEY) { 
return res.status(401).json({ error: 'Unauthorized' }); 
} 
next();
};
```

## Test Architecture

### Test Structure

```
__tests__/
├── unit/ # Individual Function Tests
│ ├── services/ # Business Logic Tests
│ ├── repositories/ # Data Access Tests
│ └── utils/ # Utility Function Tests
├── integration/ # Database Integration Tests
│ ├── graphql/ # GraphQL Resolver Tests
│ ├── auth/ # Authentication Flow Tests
│ └── database/ # Database Operation Tests
├── e2e/ # End-to-End API Tests
│ ├── user-flows/ # Complete User Journey Tests
│ └── admin-flows/ # Admin Operation Tests
└── fixtures/ # Test Data and Utilities
├── factories/ # Test Data Generation
└── helpers/ # Test Utility Functions
```

### Test Patterns

#### Factory Pattern (Test Data Generation)
``` typescript
// Example: User factory for consistent test data
export const createUser = (overrides?: Partial<User>): User => ({
id: faker.datatype.uuid(),
name: faker.name.fullName(),
email: faker.internet.email(),
createdAt: new Date(),
...overrides
});
```

#### Repository Mock (Unit Test Isolation)
``` typescript
// Example: Mock repository for service testing
const mockUserRepository = {
findById: jest.fn(),
create: jest.fn(),
update: jest.fn(),
delete: jest.fn()
};
```

#### Database Transactions (Test Data Cleanup)
``` typescript
// Example: Automatic test data cleanup
beforeEach(async () => {
await prisma.$transaction(async (tx) => {
// Test setup with transaction
});
});

afterEach(async () => {
await prisma.$transaction(async (tx) => {
// Test data cleanup
});
});
```

#### GraphQL Testing (End-to-End API Validation)
``` typescript
// Example: GraphQL Mutation Test
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

civicship-api is deployed in a multi-service configuration using Google Cloud Run:

### Main Services

1. **Internal API** - Main GraphQL API server (`src/index.ts`)
2. **External API** - Public wallet operations (`src/external-api.ts`)
3. **Batch Processing** - Background jobs (`src/batch.ts`)

### Infrastructure

- **Google Cloud Run** - Autoscaling
- **Artifact Registry** - Docker image management
- **GitHub Actions** - CI/CD pipeline
- **PostgreSQL** - Secure access via SSH tunnel

For detailed deployment configuration, see the [Deployment Guide](DEPLOYMENT.md).

## Performance Optimization

### Key Optimization Strategies

- **DataLoader Pattern** - Solving the N+1 Query Problem
- **Materialized Views** - Precomputing Complex Aggregates
- **Database Indexes** - Improving Query Performance
- **Multi-tiered Caching Strategies** - Request, Application, and Database Levels

For detailed performance optimization information, see the [Performance Guide](PERFORMANCE.md).

## Related Documents

### 🏗️ Architecture & Design
- **[Infrastructure Guide](INFRASTRUCTURE.md)** - External System Integration, Database Configuration
- **[Security Guide](SECURITY.md)** - Authentication & Authorization Architecture, Four-Layer Security
- **[Deployment Guide](DEPLOYMENT.md)** - Multi-Service Configuration, CI/CD
- **[Performance Guide](PERFORMANCE.md)** - Optimization Strategies, Monitoring & Observability

### 📚 Development & Implementation
- **[Development Workflow](DEVELOPMENT.md)** - Daily Development Procedures
- **[Implementation Patterns](PATTERNS.md)** - Code Patterns and Best Practices
- **[Testing Guide](TESTING.md)** - Testing Strategy and Execution

### 🔧 Setup & Operation
- **[Setup Guide](SETUP.md)** - Development Environment Setup
- **[Environment Variable Guide](ENVIRONMENT.md)** - Environment Settings
- **[Troubleshooting](TROUBLESHOOTING.md)** - Problem Solving Guide

### 📋 Specifications and Design
- **[Feature List](FEATURES.md)** - Business Function Details
- **[Database Design](../ERD.md)** - Entity-Relationship Diagram
- **[Command Reference](COMMANDS.md)** - Complete Command List
