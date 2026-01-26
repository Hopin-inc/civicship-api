---
name: db-migration
description: Guide through Prisma schema changes and migration process safely with validation and type generation
user-invocable: true
allowed-tools: Read, Grep, Bash
---

# Database Migration Guide for civicship-api

Safely guide through Prisma schema changes, migration creation, and type generation following project best practices.

## Usage

```bash
# Run migration workflow
/db-migration

# Check migration status only
/db-migration status
```

---

## Migration Workflow

### Step 1: Detect Schema Changes

Check if `prisma/schema.prisma` has uncommitted changes:

```bash
git status --porcelain prisma/schema.prisma
```

**If no changes:**
- Display message: "No schema changes detected"
- Check pending migrations

**If changes detected:**
- Show diff: `git diff prisma/schema.prisma`
- Proceed to validation

---

### Step 2: Validate Schema Changes

Read and analyze schema changes for common issues:

**Check for:**

1. **Breaking Changes**
   - Dropping columns without data migration
   - Changing column types (potential data loss)
   - Removing tables with foreign key dependencies
   - Changing primary keys

2. **Missing Constraints**
   - Foreign keys without indexes
   - Unique constraints on nullable fields
   - Missing @default for non-nullable fields

3. **Naming Conventions**
   - Table names: snake_case (e.g., `t_users`, `t_opportunities`)
   - Column names: camelCase (e.g., `createdAt`, `updatedAt`)
   - Enum names: PascalCase (e.g., `UserStatus`, `PublishStatus`)

4. **Row-Level Security (RLS)**
   - Tables should be prefixed with `t_` (e.g., `t_users`)
   - Check if RLS policies need updating

5. **Indexes**
   - Foreign keys should have indexes
   - Frequently queried columns should be indexed
   - Consider compound indexes for multi-column queries

**Display validation results:**

```markdown
## Schema Validation

✅ No breaking changes detected
✅ Naming conventions followed
⚠️  Missing index on foreign key: `opportunityId` in `t_reservations`
⚠️  Consider adding @default for `status` field in `t_participations`
```

---

### Step 3: Generate Migration Name

Suggest a descriptive migration name following conventions:

**Format:** `{action}_{subject}_{detail}`

**Actions:**
- `add` - New table or column
- `update` - Modify existing structure
- `remove` - Delete table or column
- `fix` - Bug fix or correction
- `refactor` - Structure improvement

**Examples:**
- `add_user_phone_field`
- `update_opportunity_status_enum`
- `remove_deprecated_wallet_type`
- `fix_reservation_foreign_key`
- `refactor_identity_primary_key`

**Analyze schema diff and suggest name:**

```bash
# If adding a new table
add_products_table

# If adding a field
add_user_email_verified_field

# If modifying enum
update_publish_status_enum
```

---

### Step 4: Create Migration

**IMPORTANT: Do NOT run migration automatically. Ask user for confirmation first.**

Display the migration command and wait for approval:

```markdown
## Migration Command

Ready to create migration with name: `add_user_phone_field`

Command to run:
\`\`\`bash
pnpm db:migrate add_user_phone_field
\`\`\`

⚠️  **Before proceeding:**
1. Review schema changes one more time
2. Ensure no active development on affected tables
3. Backup production database if applying to production

Do you want to proceed? (yes/no)
```

**If user confirms:**

```bash
pnpm db:migrate add_user_phone_field
```

**Expected output:**
- Migration file created in `prisma/migrations/`
- SQL file generated

---

### Step 5: Review Generated SQL

Read and display the generated migration SQL:

```bash
# Find the latest migration
LATEST_MIGRATION=$(ls -t prisma/migrations/ | head -1)

# Display SQL
cat "prisma/migrations/${LATEST_MIGRATION}/migration.sql"
```

**Review checklist:**

- ✅ SQL syntax is correct
- ✅ No DROP TABLE without data migration
- ✅ ALTER TABLE changes are safe
- ✅ Indexes are created for foreign keys
- ✅ Default values are appropriate

**Ask user to review:**

```markdown
## Generated Migration SQL

\`\`\`sql
[Display SQL content here]
\`\`\`

Does this SQL look correct? (yes/no)
```

---

### Step 6: Generate Prisma Client

After migration creation, generate TypeScript types:

```bash
pnpm db:generate
```

**This will:**
- Update `@prisma/client` types
- Generate TypeScript definitions
- Update `node_modules/.prisma/client/`

**Verify generation:**

```bash
# Check if Prisma client was updated
ls -la node_modules/.prisma/client/index.d.ts
```

---

### Step 7: Update Application Code

**Check if any application code needs updates:**

1. **Find files importing Prisma types:**
   ```bash
   grep -r "from '@prisma/client'" src/ --files-with-matches
   ```

2. **Find files with Prisma select shapes:**
   ```bash
   grep -r "select.*{" src/application/domain/**/data/type.ts --files-with-matches
   ```

3. **Display files that may need updates:**

```markdown
## Files That May Need Updates

The following files import Prisma types and may need updates:

- src/application/domain/account/user/data/type.ts
- src/application/domain/account/membership/service.ts
- src/application/domain/experience/opportunity/data/repository.ts

Please review these files for:
- New fields in select shapes
- Updated enum values
- Changed type definitions
```

---

### Step 8: Verify TypeScript Compilation

Compile TypeScript to check for type errors:

```bash
pnpm build
```

**If errors:**
- Display compilation errors
- Suggest fixes based on error messages
- Common issues:
  - Missing properties in types
  - Enum value changes
  - Type mismatches

**If successful:**

```markdown
✅ TypeScript compilation successful
✅ No type errors detected
```

---

### Step 9: Run Tests

**IMPORTANT: Always run tests after schema changes.**

```bash
pnpm test --runInBand
```

**If tests fail:**
- Display failed tests
- Suggest checking:
  - Test fixtures (may need updated data)
  - Factory definitions (Prisma Fabbrica)
  - Seed data scripts

**If tests pass:**

```markdown
✅ All tests passed
✅ Database schema changes are compatible with existing code
```

---

### Step 10: Update Documentation

Remind user to update related documentation:

```markdown
## Documentation Updates

Consider updating:

- [ ] `docs/database/schema.md` - Document new tables/fields
- [ ] `docs/handbook/FEATURES.md` - Update feature documentation
- [ ] GraphQL schema comments - Add descriptions for new fields
- [ ] `CHANGELOG.md` - Add migration to changelog

Prisma schema comments are automatically included in generated types.
```

---

## Migration Best Practices

### Before Creating Migration

- ✅ Review schema changes carefully
- ✅ Check for breaking changes
- ✅ Ensure naming conventions are followed
- ✅ Add appropriate indexes
- ✅ Consider data migration needs

### After Creating Migration

- ✅ Review generated SQL
- ✅ Run `pnpm db:generate`
- ✅ Fix TypeScript compilation errors
- ✅ Run tests with `pnpm test --runInBand`
- ✅ Update application code if needed
- ✅ Update documentation

### For Production Migrations

- ✅ Test migration on staging environment first
- ✅ Backup production database
- ✅ Plan for downtime if needed
- ✅ Have rollback plan ready
- ✅ Monitor application after deployment

---

## Common Migration Patterns

### Adding a New Table

```prisma
model t_products {
  id          String   @id @default(cuid())
  name        String
  price       Int
  communityId String
  community   t_communities @relation(fields: [communityId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([communityId])
  @@map("t_products")
}
```

**Migration name:** `add_products_table`

### Adding a Column

```prisma
model t_users {
  // ... existing fields
  phoneNumber String? // New field
}
```

**Migration name:** `add_user_phone_number_field`

### Updating an Enum

```prisma
enum PublishStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED  // New value
}
```

**Migration name:** `update_publish_status_enum_add_scheduled`

### Adding an Index

```prisma
model t_opportunities {
  // ... existing fields

  @@index([communityId, publishStatus]) // New compound index
}
```

**Migration name:** `add_opportunity_community_status_index`

---

## Troubleshooting

### Migration Fails

**Error:** "Migration failed to apply"

**Solutions:**
1. Check PostgreSQL connection: `pnpm container:up`
2. Verify database credentials in `.env`
3. Check if tables/columns already exist
4. Review migration SQL for syntax errors

### Type Generation Fails

**Error:** "Prisma client generation failed"

**Solutions:**
1. Check Prisma schema syntax: `pnpm prisma format`
2. Verify all relations are valid
3. Check for circular dependencies
4. Ensure all referenced models exist

### Tests Fail After Migration

**Error:** Tests fail with database errors

**Solutions:**
1. Update test fixtures with new fields
2. Re-seed test database: `pnpm db:seed-domain`
3. Update Prisma Fabbrica factories
4. Check for missing required fields

---

## Reference

See `@CLAUDE.md` for:
- Database commands (`pnpm db:*`)
- Migration workflow
- Prisma schema conventions
- Testing after migrations
