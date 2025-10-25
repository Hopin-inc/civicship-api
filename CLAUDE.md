# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**civicship-api** is a GraphQL API server built with TypeScript, following **Domain-Driven Design (DDD)** and **Clean Architecture** principles. It provides a platform for community engagement with point-based rewards, opportunity management, and LINE messaging integration.

**Tech Stack:** TypeScript + Node.js + Apollo Server + Prisma ORM + PostgreSQL + Firebase Auth

## Essential Commands

### Development
```bash
# Start development server (HTTPS)
pnpm dev:https

# Start development server (HTTP)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Operations
```bash
# Generate Prisma client and types
pnpm db:generate

# Create new migration (after schema changes)
pnpm db:migrate

# Apply migrations to database
pnpm db:deploy

# Seed master data (cities, states)
pnpm db:seed-master

# Seed domain data (users, communities)
pnpm db:seed-domain

# Open Prisma Studio (database GUI)
pnpm db:studio

# Pull schema from database
pnpm db:pull
```

### GraphQL Code Generation
```bash
# Generate TypeScript types from GraphQL schemas
pnpm gql:generate
```

### Testing
```bash
# Run all tests (serial execution with --runInBand)
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test path/to/test.test.ts

# Run tests in watch mode
pnpm test --watch
```

### Code Quality
```bash
# Run linter and formatter
pnpm lint

# Format code only
prettier --write src/
```

### Docker
```bash
# Start PostgreSQL container (port 15432)
pnpm container:up

# Stop and remove containers
pnpm container:down
```

## Architecture Overview

### Layer Structure

The codebase follows **Clean Architecture** with 3 main layers:

1. **Application Layer** (`src/application/`) - Business logic and domain operations
2. **Infrastructure Layer** (`src/infrastructure/`) - Database, external services, Firebase, GCS
3. **Presentation Layer** (`src/presentation/`) - GraphQL API, middleware, REST endpoints

### Core Business Domains

Located in `src/application/domain/`:

- **account/** - User, Community, Membership, Identity, Wallet, NFT Wallet (8 subdomains)
- **experience/** - Opportunity, Reservation, Participation, Evaluation
- **content/** - Article, Image management
- **reward/** - Utility, Ticket, point-based rewards
- **transaction/** - Point transfers between wallets
- **notification/** - LINE messaging integration
- **location/** - Geographic data (Place, City, State)

### Standard Domain Pattern

Each domain follows this consistent structure:

```
domain/{domain-name}/
├── controller/
│   ├── resolver.ts         # GraphQL Query/Mutation/field resolvers
│   └── dataloader.ts       # N+1 prevention (batch loading)
├── usecase.ts             # Business flow orchestration
├── service.ts             # Business logic & validation
├── data/
│   ├── repository.ts      # Prisma database queries
│   ├── interface.ts       # Repository interface contract
│   ├── converter.ts       # GraphQL input → Prisma format
│   └── type.ts            # TypeScript types (Prisma select shapes)
├── presenter.ts           # Prisma → GraphQL response formatting
└── schema/
    ├── query.graphql      # Query definitions
    ├── mutation.graphql   # Mutation definitions
    └── type.graphql       # Type definitions
```

### Data Flow Pattern

**Request Flow:**
```
GraphQL Request
  → Resolver (controller/resolver.ts)
  → UseCase (usecase.ts) - orchestration, authorization, transactions
  → Service (service.ts) - business logic, validation
  → Repository (data/repository.ts) - Prisma queries
  → Database
```

**Response Flow:**
```
Prisma Result
  → Presenter (presenter.ts) - format to GraphQL types
  → UseCase
  → Resolver
  → GraphQL Response
```

## Critical Implementation Rules

### Layer Responsibilities

**DO NOT violate these rules - they are core architectural principles:**

1. **Resolver** (`controller/resolver.ts`)
   - ✅ Call usecase methods only
   - ✅ Use dataloaders for field resolvers to prevent N+1
   - ❌ No business logic
   - ❌ No direct repository calls

2. **UseCase** (`usecase.ts`)
   - ✅ Orchestrate business flows
   - ✅ Manage transactions via `ctx.issuer.onlyBelongingCommunity(ctx, async tx => {...})`
   - ✅ Call services (own domain and other domains)
   - ✅ Call presenters to format responses
   - ❌ Never call other domain's usecases (circular dependency risk)

3. **Service** (`service.ts`)
   - ✅ Implement business logic and validation
   - ✅ Call repositories
   - ✅ Call other domain services (read operations only)
   - ✅ Handle `tx` parameter with `if (tx)` branching
   - ❌ No cross-domain usecase calls
   - ❌ Never return GraphQL types (`GqlXxx`) - return Prisma types only

4. **Repository** (`data/repository.ts`)
   - ✅ Execute Prisma queries
   - ✅ Use `ctx.issuer` for Row-Level Security (RLS)
   - ✅ Handle `tx` parameter with `if (tx)` branching
   - ❌ No business logic

5. **Converter** (`data/converter.ts`)
   - ✅ Transform GraphQL input → Prisma format
   - ✅ Pure functions only (no side effects)
   - ❌ No transaction dependency
   - ❌ No database queries

6. **Presenter** (`presenter.ts`)
   - ✅ Transform Prisma types → GraphQL types
   - ✅ Pure functions only
   - ❌ No business logic
   - ❌ No database queries

### Transaction Handling Pattern

Transactions are **ONLY** managed at the UseCase layer:

```typescript
// ✅ CORRECT: Transaction in UseCase
async managerCreateOpportunity({ input, permission }, ctx) {
  return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
    const record = await this.service.createOpportunity(ctx, input, permission.communityId, tx);
    return OpportunityPresenter.create(record);
  });
}

// Service receives and uses tx
async createOpportunity(ctx, input, communityId, tx) {
  return await this.repository.create(ctx, data, tx);
}

// Repository handles tx with branching
async create(ctx, data, tx?) {
  if (tx) {
    return tx.opportunity.create({ data });
  }
  return ctx.issuer.public(ctx, (tx) => tx.opportunity.create({ data }));
}
```

### Authorization Pattern

Use `ctx.issuer` methods for Row-Level Security:

- `ctx.issuer.public(ctx, tx => {...})` - Public queries
- `ctx.issuer.internal(ctx, tx => {...})` - Internal/admin queries
- `ctx.issuer.onlyBelongingCommunity(ctx, async tx => {...})` - User's communities only (with transaction)

### GraphQL Type Naming

- Types: `GqlUser`, `GqlCommunity` (generated in `src/types/graphql.ts`)
- Inputs: `GqlCreateUserInput`, `GqlUpdateCommunityInput`
- Payloads: `GqlUserPayload`, `GqlCommunityConnection`
- Prisma types: `PrismaUser`, `PrismaCommunity` (from `@prisma/client`)

## Adding a New Feature (Step-by-Step)

When adding a GraphQL feature, follow **ALL** these steps:

1. **Define GraphQL Schema** - Add to domain's `schema/` directory
   - `query.graphql` for queries
   - `mutation.graphql` for mutations
   - `type.graphql` for types/enums

2. **Generate Types** - Run `pnpm gql:generate` to generate TypeScript types

3. **Implement Resolver** - Add to `controller/resolver.ts`
   - Use dependency injection: `@inject("XxxUseCase")`
   - Delegate to usecase immediately

4. **Implement UseCase** - Add flow to `usecase.ts`
   - Manage transactions
   - Call services
   - Call presenter before returning

5. **Implement Service** - Add business logic to `service.ts`
   - Validate inputs
   - Call repository

6. **Update Repository** (if needed) - Add queries to `data/repository.ts`
   - Use Prisma client
   - Handle `tx` parameter

7. **Add Converter Logic** (if needed) - Update `data/converter.ts`
   - Transform GraphQL input to Prisma format

8. **Add Presenter Logic** - Update `presenter.ts`
   - Transform Prisma result to GraphQL response

9. **Add DataLoader** (if needed for field resolvers) - Update `controller/dataloader.ts`

10. **Write Tests**
    - Unit tests for service logic
    - Integration tests for GraphQL queries/mutations

## DataLoader Pattern (N+1 Prevention)

Use DataLoaders in **field resolvers** to batch database queries:

```typescript
// In resolver field:
Opportunity: {
  community: (parent, _, ctx) => ctx.loaders.community.load(parent.communityId),
  createdByUser: (parent, _, ctx) => ctx.loaders.user.load(parent.createdBy)
}

// DataLoader automatically batches these into single queries
```

**When to use DataLoaders:**
- Field resolvers that fetch related entities
- Frequently accessed relationships
- Avoid for data already included in parent query

## Dependency Injection (tsyringe)

All services, repositories, and converters are registered in `src/application/provider.ts`.

```typescript
// Registration
container.registerSingleton("UserService", UserService);
container.registerSingleton("UserRepository", UserRepository);

// Usage in class
@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private repo: IUserRepository,
    @inject("ImageService") private imageService: ImageService
  ) {}
}
```

**For testing:** Use `container.reset()` and `container.register()` to mock dependencies.

## Testing Guidelines

### Test Structure
- `__tests__/unit/` - Service/utility tests with mocked dependencies
- `__tests__/integration/` - Feature tests with real database
- `__tests__/e2e/` - End-to-end user journey tests
- `__tests__/helper/` - Test fixtures and mocks

### Test Pattern
```typescript
import { container } from "tsyringe";

describe("UserService", () => {
  beforeEach(() => {
    container.reset();
    // Register mocks
    container.register("UserRepository", { useValue: mockRepo });
  });

  it("creates user", async () => {
    const service = container.resolve(UserService);
    const result = await service.createUser(input);
    expect(result).toBeDefined();
  });
});
```

### Running Tests
- Always use `--runInBand` for serial execution (database tests)
- Use Prisma Fabbrica for test data factories
- Clean up test data in `afterEach` hooks

## Common Patterns

### LINE Notification Messages

LINE notification messages follow a consistent builder pattern in `src/application/domain/notification/presenter/message/`:

- Use `Intl.NumberFormat("ja-JP").format()` for point formatting
- Display points as `${formattedPoints}pt` (not `ポイント`)
- Use simplified comment sections that return `null` when empty
- Use `.filter(Boolean)` to handle optional message sections
- Keep message structure clean and minimal

Example:
```typescript
function buildPointInfo(params) {
  const formattedPoints = new Intl.NumberFormat("ja-JP").format(params.transferPoints);
  return {
    type: "box",
    layout: "vertical",
    contents: [
      { type: "text", text: `${formattedPoints}pt`, size: "xxl" },
      { type: "text", text: `送付者: ${params.fromUserName}さん`, size: "sm" }
    ]
  };
}
```

### File Upload Pattern
```typescript
// Use ImageService for uploads
const uploadedImage = await this.imageService.uploadPublicImage(
  file,
  "opportunities" // folder name
);
```

### Pagination Pattern
```typescript
// Cursor-based pagination for large datasets
const items = await prisma.model.findMany({
  take: limit,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
});
```

## Environment Setup

Required environment variables in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:15432/civicship_dev
ENV=LOCAL
NODE_ENV=development
PORT=3000

# Firebase (required)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Google Cloud Storage (required)
GCS_SERVICE_ACCOUNT_BASE64=
GCS_BUCKET_NAME=
GCP_PROJECT_ID=
```

## Database Migrations

1. Modify `src/infrastructure/prisma/schema.prisma`
2. Run `pnpm db:migrate` to create migration
3. Name migration descriptively (e.g., "add_user_phone_field")
4. Run `pnpm db:generate` to update Prisma client
5. Update TypeScript types if needed

**Important:** Always review generated SQL before applying to production.

## GraphQL Schema Organization

- Schema files distributed across domains: `src/application/domain/{domain}/schema/`
- All `.graphql` files automatically merged by GraphQL-tools
- Root schema in `src/presentation/graphql/schema/`
- After schema changes, always run `pnpm gql:generate`

## Performance Considerations

- Use DataLoaders for N+1 prevention
- Leverage materialized views (`mv_current_points`, `mv_accumulated_points`)
- Check query performance with Prisma Studio
- Monitor slow queries (logged if > 1000ms)
- Use database indexes for frequently queried fields

## Security Notes

- All mutations require authentication (check `src/presentation/graphql/rule.ts`)
- Use RLS via `ctx.issuer` methods for data isolation
- Never log sensitive data (passwords, tokens, API keys)
- Validate all user inputs in service layer
- Use parameterized queries (Prisma handles this)

## Common Issues & Solutions

**Issue: GraphQL type errors after schema change**
→ Run `pnpm gql:generate` to regenerate types

**Issue: Database connection errors**
→ Check `DATABASE_URL` in `.env` and ensure PostgreSQL is running (`pnpm container:up`)

**Issue: Transaction deadlocks in tests**
→ Use `--runInBand` flag: `pnpm test --runInBand`

**Issue: Import path errors**
→ Use `@/` alias for absolute imports (configured in tsconfig.json)

**Issue: Prisma client out of sync**
→ Run `pnpm db:generate` after any schema changes

## Documentation References

Comprehensive documentation available in `docs/handbook/`:
- `ARCHITECTURE.md` - Detailed architecture guide
- `PATTERNS.md` - Implementation patterns
- `DEVELOPMENT.md` - Development workflow
- `TESTING.md` - Testing strategies
- `FEATURES.md` - Business features overview
- `SECURITY.md` - Security architecture
- `PERFORMANCE.md` - Performance optimization

## Key Files to Know

- `src/application/provider.ts` - Dependency injection container setup (275 lines)
- `src/infrastructure/prisma/client.ts` - Row-Level Security implementation
- `src/presentation/graphql/rule.ts` - Authorization rules
- `src/presentation/middleware/auth.ts` - Authentication middleware
- `src/types/graphql.ts` - Generated GraphQL types (auto-generated)
