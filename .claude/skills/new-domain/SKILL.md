---
name: new-domain
description: Create a new domain following DDD/Clean Architecture pattern with complete file structure
user-invocable: true
argument-hint: [domain-name] [parent-category]
allowed-tools: Read, Write, Edit, Bash
---

# New Domain Creation for civicship-api

Create a new domain following **DDD (Domain-Driven Design)** and **Clean Architecture** principles with complete directory structure, template files, and dependency injection setup.

## Usage

```bash
# Create a new domain in existing category
/new-domain article content

# Create a new domain in a new category
/new-domain product marketplace
```

**Arguments:**
- `$ARGUMENTS[0]`: Domain name (e.g., `article`, `product`, `review`)
- `$ARGUMENTS[1]`: Parent category (e.g., `content`, `experience`, `account`, `reward`)

---

## Domain Structure Template

The skill will create the following complete structure:

```
src/application/domain/{category}/{domain-name}/
├── controller/
│   ├── resolver.ts          # GraphQL Query/Mutation/field resolvers
│   └── dataloader.ts        # N+1 prevention (batch loading)
├── usecase.ts               # Business flow orchestration
├── service.ts               # Business logic & validation
├── data/
│   ├── repository.ts        # Prisma database queries
│   ├── interface.ts         # Repository interface contract
│   ├── converter.ts         # GraphQL input → Prisma format
│   └── type.ts              # TypeScript types (Prisma select shapes)
├── presenter.ts             # Prisma → GraphQL response formatting
└── schema/
    ├── query.graphql        # Query definitions
    ├── mutation.graphql     # Mutation definitions
    └── type.graphql         # Type definitions
```

---

## Step-by-Step Process

### Step 1: Validate Arguments

Extract domain name and category from `$ARGUMENTS`:

```bash
DOMAIN_NAME="${$ARGUMENTS[0]}"    # e.g., "article"
CATEGORY="${$ARGUMENTS[1]}"       # e.g., "content"
```

**Validation:**
- Domain name must be lowercase, alphanumeric with hyphens
- Category must be one of: `account`, `content`, `experience`, `reward`, `location`, `transaction`, `notification`
- Check if domain already exists

### Step 2: Create Directory Structure

```bash
BASE_PATH="src/application/domain/${CATEGORY}/${DOMAIN_NAME}"

mkdir -p "${BASE_PATH}/controller"
mkdir -p "${BASE_PATH}/data"
mkdir -p "${BASE_PATH}/schema"
```

### Step 3: Generate Template Files

Create each file based on templates in `.claude/skills/new-domain/templates/`:

1. **controller/resolver.ts** - GraphQL resolvers
   - Import UseCase via DI
   - Define Query, Mutation, and field resolvers
   - Use DataLoaders for relationships

2. **controller/dataloader.ts** - DataLoader setup
   - Batch loading for N+1 prevention
   - Load related entities

3. **usecase.ts** - Business flow orchestration
   - Manage transactions with `ctx.issuer.onlyBelongingCommunity()`
   - Call services and presenters
   - No direct repository access

4. **service.ts** - Business logic
   - Validation and business rules
   - Call repositories
   - Accept and propagate `tx` parameter

5. **data/repository.ts** - Database access
   - Prisma queries with RLS (`ctx.issuer`)
   - Two transaction patterns:
     - Mutation methods: required `tx: Prisma.TransactionClient`
     - Query methods: optional `tx?: Prisma.TransactionClient` with `if (tx)` branching

6. **data/interface.ts** - Repository contract
   - Interface definition for repository

7. **data/converter.ts** - Input transformation
   - GraphQL input → Prisma format
   - Pure functions (no side effects)

8. **data/type.ts** - TypeScript types
   - Prisma select shapes
   - Type definitions

9. **presenter.ts** - Response formatting
   - Prisma → GraphQL types
   - Pure functions (no business logic)

10. **schema/query.graphql** - GraphQL queries
    - Query definitions

11. **schema/mutation.graphql** - GraphQL mutations
    - Mutation definitions

12. **schema/type.graphql** - GraphQL types
    - Type, Input, Payload definitions
    - Follow `Gql*` naming convention

### Step 4: Register Dependencies

**File: `src/application/provider.ts`**

Add imports (alphabetically within category section):

```typescript
import ${DomainName}UseCase from "@/application/domain/${category}/${domain-name}/usecase";
import ${DomainName}Service from "@/application/domain/${category}/${domain-name}/service";
import ${DomainName}Repository from "@/application/domain/${category}/${domain-name}/data/repository";
import ${DomainName}Converter from "@/application/domain/${category}/${domain-name}/data/converter";
```

Add registrations in appropriate section:

```typescript
// 📦 ${Category}

container.register("${DomainName}UseCase", { useClass: ${DomainName}UseCase });
container.register("${DomainName}Service", { useClass: ${DomainName}Service });
container.register("${DomainName}Repository", { useClass: ${DomainName}Repository });
container.register("${DomainName}Converter", { useClass: ${DomainName}Converter });
```

### Step 5: Register GraphQL Resolvers

**File: `src/presentation/graphql/resolver.ts`**

Add import:

```typescript
import ${DomainName}Resolver from "@/application/domain/${category}/${domain-name}/controller/resolver";
```

Add resolver instantiation:

```typescript
const ${domainName} = container.resolve(${DomainName}Resolver);
```

Add to resolvers object:

```typescript
const resolvers = {
  Query: {
    ...${domainName}.Query,
    // ...
  },
  Mutation: {
    ...${domainName}.Mutation,
    // ...
  },
  ${DomainName}: ${domainName}.${DomainName},
  // ...
};
```

### Step 6: Run Code Generation

After creating GraphQL schema files:

```bash
pnpm gql:generate
```

This generates TypeScript types in `src/types/graphql.ts`.

### Step 7: Verify Setup

1. Check TypeScript compilation:
   ```bash
   pnpm build
   ```

2. Verify DI registration:
   - All services should resolve without errors

3. Review generated files:
   - Each file should follow architecture patterns
   - No TODOs or placeholder logic left

---

## Template Placeholders

Templates use the following placeholders:

| Placeholder | Example | Description |
|-------------|---------|-------------|
| `{{DOMAIN_NAME}}` | `article` | Domain name (lowercase-kebab-case) |
| `{{DomainName}}` | `Article` | Domain name (PascalCase) |
| `{{domainName}}` | `article` | Domain name (camelCase) |
| `{{CATEGORY}}` | `content` | Category name (lowercase) |
| `{{Category}}` | `Content` | Category name (PascalCase) |

---

## Architecture Compliance Checklist

After domain creation, verify:

- ✅ **Resolver** calls UseCase methods only
- ✅ **UseCase** manages transactions with `ctx.issuer.onlyBelongingCommunity()`
- ✅ **Service** implements business logic and passes `tx` to Repository
- ✅ **Repository** uses RLS (`ctx.issuer`) for all queries
- ✅ **Repository** handles `tx` parameter correctly (required for mutations, optional for queries)
- ✅ **Converter** is pure functions (no side effects)
- ✅ **Presenter** transforms Prisma → GraphQL types
- ✅ **GraphQL types** follow `Gql*` naming convention
- ✅ **DataLoader** used for field resolvers (N+1 prevention)
- ✅ **DI registration** in `provider.ts`
- ✅ **Resolver registration** in `resolver.ts`
- ✅ **GraphQL codegen** executed successfully

---

## Example Output

After running `/new-domain product marketplace`:

```
✅ Created domain structure: src/application/domain/marketplace/product/
✅ Generated 12 files:
   - controller/resolver.ts
   - controller/dataloader.ts
   - usecase.ts
   - service.ts
   - data/repository.ts
   - data/interface.ts
   - data/converter.ts
   - data/type.ts
   - presenter.ts
   - schema/query.graphql
   - schema/mutation.graphql
   - schema/type.graphql

✅ Updated src/application/provider.ts (4 registrations)
✅ Updated src/presentation/graphql/resolver.ts

⚠️  Next steps:
1. Run: pnpm gql:generate
2. Implement business logic in service.ts
3. Define GraphQL schema in schema/ directory
4. Add tests in __tests__/unit/marketplace/product/
5. Run: /validate-architecture marketplace/product
```

---

## Reference

See `@CLAUDE.md` for complete architecture documentation and implementation patterns.
