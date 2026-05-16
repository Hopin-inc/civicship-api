---
description: Scaffold a new DDD domain following civicship-api conventions
argument-hint: <domain-name>
---

Scaffold a new domain at `src/application/domain/$ARGUMENTS/` following the
canonical structure documented in CLAUDE.md.

# Steps

1. **Confirm intent**

   Before creating anything, restate:
   - Domain name: `$ARGUMENTS`
   - One-sentence purpose (ask the user if not obvious)
   - Which existing domain(s) it depends on

   **Validate the domain name** before using it anywhere on disk. The
   name must match `^[a-z][a-z0-9-]*$` (lowercase, digits, hyphens,
   starting with a letter). Refuse to proceed if it contains `..`,
   `/`, whitespace, uppercase letters, or any other character outside
   that regex; this prevents path traversal and keeps the directory
   layout consistent with existing domains.

   Get a thumbs-up before writing files.

2. **Generate directory layout**

   ```
   src/application/domain/$ARGUMENTS/
   ├── controller/
   │   ├── resolver.ts
   │   └── dataloader.ts
   ├── usecase.ts
   ├── service.ts
   ├── data/
   │   ├── repository.ts
   │   ├── interface.ts
   │   ├── converter.ts
   │   └── type.ts
   ├── presenter.ts
   └── schema/
       ├── query.graphql
       ├── mutation.graphql
       └── type.graphql
   ```

   For each file, use an existing similar domain as the template
   (search `src/application/domain/` and pick the closest match).
   Do not invent a structure.

3. **Wire dependency injection**

   Add registrations to `src/application/provider.ts`:
   - `XxxUseCase`, `XxxService`, `XxxRepository`, `XxxConverter`

4. **GraphQL schema**

   Add minimal placeholder Query/Mutation/Type stubs in
   `schema/*.graphql`. Run `pnpm gql:generate` (PostToolUse hook will
   trigger automatically, but verify the output landed in
   `src/types/graphql.ts`).

5. **Surface next steps to the human**

   List:
   - Files created
   - DI tokens added
   - Schema types added
   - What the human still needs to fill in (business logic, validation,
     auth rules in `presentation/graphql/rule.ts`)

Do not invent business logic. The scaffold is a skeleton; the human
fills the meat.

# Related

If the existing `validate-architecture` skill or `architecture-validator`
subagent is available, run it against the new domain before declaring
done.
