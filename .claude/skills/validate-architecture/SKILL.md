---
name: validate-architecture
description: Validate DDD/Clean Architecture compliance in code changes, checking layer violations, transaction patterns, and Row-Level Security
context: fork
agent: Explore
allowed-tools: Read, Grep, Bash
user-invocable: true
argument-hint: [path or domain name]
---

# Architecture Validation for civicship-api

Validate code changes against **DDD (Domain-Driven Design)** and **Clean Architecture** principles.

If `$ARGUMENTS` is provided, validate that specific path or domain. Otherwise, validate all uncommitted changes in the current branch.

---

## Critical Architecture Rules

### 1. Layer Violations

**Resolver Layer** (`controller/resolver.ts`)
- ✅ MUST call usecase methods only
- ✅ MUST use dataloaders for field resolvers (N+1 prevention)
- ❌ NEVER write business logic
- ❌ NEVER call repositories directly

**UseCase Layer** (`usecase.ts`)
- ✅ MUST orchestrate business flows using services
- ✅ MUST manage transactions with `ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {...})`
- ✅ CAN call services from own domain and other domains
- ✅ MUST call presenters before returning
- ❌ NEVER call other domain's usecases (causes circular dependencies)

**Service Layer** (`service.ts`)
- ✅ MUST implement business logic and validation
- ✅ MUST call repositories
- ✅ CAN call other domain services (read operations only)
- ✅ MUST handle `tx` parameter with `if (tx)` branching
- ❌ NEVER return GraphQL types (`GqlXxx`) - return Prisma types only

**Repository Layer** (`data/repository.ts`)
- ✅ MUST execute Prisma queries only
- ✅ MUST use `ctx.issuer` for Row-Level Security (RLS)
- ✅ MUST handle `tx` parameter with `if (tx)` branching
- ❌ NEVER contain business logic

**Converter** (`data/converter.ts`)
- ✅ MUST be pure functions (GraphQL input → Prisma format)
- ❌ NEVER use transactions
- ❌ NEVER execute database queries

**Presenter** (`presenter.ts`)
- ✅ MUST be pure functions (Prisma → GraphQL types)
- ❌ NEVER contain business logic
- ❌ NEVER execute database queries

---

### 2. Transaction Pattern Validation

**CORRECT Pattern:**
```typescript
// UseCase manages transactions
async managerCreateOpportunity({ input }, ctx) {
  return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
    const record = await this.service.createOpportunity(ctx, input, tx);
    return OpportunityPresenter.create(record);
  });
}

// Service receives tx
async createOpportunity(ctx, input, tx) {
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

**VIOLATIONS to Flag:**
- ❌ Transactions started in Service or Repository layer
- ❌ Missing `tx` parameter propagation
- ❌ Missing `if (tx)` branching in Repository

---

### 3. Row-Level Security (RLS) Validation

**REQUIRED Patterns:**
- `ctx.issuer.public(ctx, tx => {...})` - Public queries
- `ctx.issuer.internal(ctx, tx => {...})` - Internal/admin queries
- `ctx.issuer.onlyBelongingCommunity(ctx, async tx => {...})` - User's communities only

**VIOLATIONS to Flag:**
- ❌ Direct Prisma queries without `ctx.issuer` wrapper
- ❌ Missing `communityId` isolation checks
- ❌ Repositories not using RLS methods

---

### 4. GraphQL Type Naming

**CORRECT:**
- Types: `GqlUser`, `GqlCommunity`
- Inputs: `GqlCreateUserInput`, `GqlUpdateCommunityInput`
- Payloads: `GqlUserPayload`, `GqlCommunityConnection`
- Prisma types: `PrismaUser`, `PrismaCommunity`

**VIOLATIONS to Flag:**
- ❌ Services returning `GqlXxx` types
- ❌ GraphQL types used in service/repository layers
- ❌ Incorrect naming conventions

---

### 5. DataLoader N+1 Prevention

**Field resolvers MUST use DataLoaders:**
```typescript
Opportunity: {
  community: (parent, _, ctx) => ctx.loaders.community.load(parent.communityId),
  createdByUser: (parent, _, ctx) => ctx.loaders.user.load(parent.createdBy)
}
```

**VIOLATIONS to Flag:**
- ❌ Field resolvers making direct database queries
- ❌ Missing DataLoader definitions in `controller/dataloader.ts`

---

## Validation Process

### Step 1: Identify Files to Validate

If `$ARGUMENTS` provided:
```bash
# Validate specific domain
find src/application/domain/$ARGUMENTS -type f \( -name "*.ts" -o -name "*.graphql" \)
```

Otherwise:
```bash
# Validate uncommitted changes
git status --porcelain | grep -E '^\s*M|^\s*A' | awk '{print $2}'
```

### Step 2: Read and Analyze Files

For each file, perform layer-specific checks:

**For `controller/resolver.ts`:**
- Search for direct repository calls (e.g., `repository.find`, `repository.create`)
- Verify all field resolvers use `ctx.loaders`

**For `usecase.ts`:**
- Verify `ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => ...)` pattern
- Check for calls to other domain's usecases (e.g., `otherDomainUseCase.doSomething()`)
- Verify presenter is called before returning

**For `service.ts`:**
- Search for `Gql` type imports or returns
- Verify `tx` parameter is properly declared and passed
- Check for inappropriate cross-domain usecase calls

**For `data/repository.ts`:**
- Verify all queries use `ctx.issuer.public/internal/onlyBelongingCommunity`
- Check `if (tx)` branching exists
- Search for business logic (complex conditionals, validation)

**For `data/converter.ts`:**
- Verify no `tx` parameter
- Verify no Prisma client usage

**For `presenter.ts`:**
- Verify pure functions only
- Verify no Prisma client usage

**For `schema/*.graphql`:**
- Verify type naming follows `Gql*` convention
- Check for matching resolver implementation

### Step 3: Report Findings

Generate a structured report:

```markdown
# Architecture Validation Report

## Summary
- Files Analyzed: X
- Violations Found: Y
- Critical Issues: Z

## Violations

### Layer Violations
- [ ] **File**: `src/application/domain/opportunity/controller/resolver.ts:45`
  - **Issue**: Resolver calls repository directly
  - **Fix**: Call usecase method instead

### Transaction Pattern Issues
- [ ] **File**: `src/application/domain/user/service.ts:120`
  - **Issue**: Missing `tx` parameter propagation to repository
  - **Fix**: Add `tx` parameter and pass to repository methods

### Row-Level Security Issues
- [ ] **File**: `src/application/domain/community/data/repository.ts:78`
  - **Issue**: Direct Prisma query without `ctx.issuer`
  - **Fix**: Wrap query with `ctx.issuer.public(ctx, tx => ...)`

### GraphQL Type Violations
- [ ] **File**: `src/application/domain/wallet/service.ts:56`
  - **Issue**: Service returns `GqlWallet` type
  - **Fix**: Return Prisma type, convert in presenter

### DataLoader Missing
- [ ] **File**: `src/application/domain/opportunity/controller/resolver.ts:89`
  - **Issue**: Field resolver queries database directly
  - **Fix**: Use `ctx.loaders.community.load(parent.communityId)`

## Recommendations

1. Review @CLAUDE.md for complete architecture guidelines
2. Run `pnpm test` to ensure no regressions
3. Consider adding unit tests for business logic in services
```

---

## Additional Checks

### Dependency Injection Validation
- Verify all services/repositories are registered in `src/application/provider.ts`
- Check `@injectable()` and `@inject("ServiceName")` decorators

### GraphQL Schema Sync
- After schema changes, verify `pnpm gql:generate` was run
- Check for TypeScript compilation errors

### Security Checks
- No passwords or secrets logged
- Input validation in service layer
- Parameterized queries (Prisma handles this)

---

## Exit Criteria

Report is complete when:
- ✅ All files in scope have been analyzed
- ✅ Each violation includes file path, line number, and fix suggestion
- ✅ Summary statistics are accurate
- ✅ Recommendations are actionable

---

## Reference

See `@CLAUDE.md` for complete architecture documentation and implementation patterns.
