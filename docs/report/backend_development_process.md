# Backend Development Process for civicship-api

This report provides a self-contained overview of how backend development is conducted in the civicship-api repository. It covers architecture and principles (DDD + Clean Architecture), local environment and setup, development workflow and branching, essential commands, testing, security/authorization, deployment and CI/CD, troubleshooting/performance, and change management/QA.

Audience: External reviewers and contributors who need an end-to-end understanding of backend development in this repository.

Scope: Backend only. Frontend and client-side LIFF details are out of scope except where relevant to API integration.

Contents
1. Executive Summary
2. Architecture and Principles
3. Local Environment and Setup
4. Development Workflow and Branching
5. Working Set of Commands (Backend)
6. Testing Strategy
7. Security and Access Control
8. Deployment and CI/CD
9. Troubleshooting and Performance
10. Change Management and Quality Assurance
11. Appendix

1) Executive Summary
- Tech stack: Node.js 20+ / TypeScript, GraphQL, Prisma/PostgreSQL, Docker, pnpm.
- Architecture: Domain-Driven Design (DDD) and Clean Architecture with clear layering and bounded contexts.
- Services: Internal API, External API, and Batch jobs.
- Day-to-day: pnpm-based workflow, Prisma for schema/migrations/seeds, Jest for tests, GitHub Actions for CI/CD to Google Cloud Run.
- Start here: Development Workflow, Testing, Deployment.

2) Architecture and Principles (DDD + Clean Architecture)
- Intent: Keep business logic independent of frameworks and infrastructure, and organize code by domain with explicit boundaries.
- Layers overview
  - Application layer (business logic and domain operations): src/application/
  - Infrastructure layer (external systems and persistence): src/infrastructure/
  - Presentation/API layer (GraphQL, HTTP): src/presentation/ (if applicable in this repo version)
- Domain structure (condensed)
  - account (auth, community, identity, membership, nft-wallet, user, wallet)
  - experience (opportunity, reservation, participation, evaluation)
  - content (article, image)
  - reward (utility, ticket)
  - transaction, notification, location
- Infrastructure highlights
  - Prisma for DB schema/migrations/seeds/factories
  - Integrations such as Firebase Auth and Google Cloud Storage
- Why this matters
  - Testability: business logic is isolated and testable without infrastructure
  - Flexibility: external services can be swapped with minimal impact
  - Clarity: teams can work within clear bounded contexts

3) Local Environment and Setup
- Requirements
  - Node.js: 20+
  - Package manager: pnpm
  - Docker: for PostgreSQL
  - Optional: OpenSSL for HTTPS local dev (if using dev:https)
- Environment variables (examples use placeholders; never commit secrets)
  - DATABASE_URL=postgresql://postgres:password@localhost:15432/civicship_dev
  - FIREBASE_PROJECT_ID=your-firebase-project
  - FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
  - FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  - ALLOWED_ORIGINS=https://localhost:3000
  - EXPRESS_SESSION_SECRET=replace-with-random-string
  - Additional variables may exist for Google Cloud Storage, LINE, etc. Provide values via environment or .env (do not commit).
- Typical setup flow
  1. pnpm install
  2. Start database container: pnpm container:up
  3. Prisma generate and apply schema:
     - pnpm db:generate
     - pnpm db:deploy (or pnpm db:migrate where applicable)
  4. Seed data:
     - pnpm db:seed-master
     - pnpm db:seed-domain
  5. Start server:
     - pnpm dev (HTTP)
     - pnpm dev:https (HTTPS with local certs)
- Validation checks
  - npx tsc --noEmit
  - pnpm test or pnpm test:coverage
  - pnpm gql:generate (GraphQL codegen/types)

4) Development Workflow and Branching
- Branching
  - Use feature/your-feature-name and fix/your-bug-fix-name branches
  - Open PRs against develop (or master when requested)
- Commit and PR practices
  - Keep commits small and focused
  - Include documentation updates when behavior changes
  - Ensure all checks pass locally before creating a PR
- Pre-PR checklist
  - pnpm lint
  - pnpm test (or pnpm test:coverage)
  - npx tsc --noEmit
  - pnpm build (when relevant)
- Code review focus
  - Correctness, readability, and test coverage
  - Respect domain boundaries and architecture patterns
  - Security considerations for authentication and authorization

5) Working Set of Commands (Backend)
- Development and build
  - pnpm dev                      # HTTP dev server (port 3000)
  - pnpm dev:https                # HTTPS dev server (port 3000, with local SSL)
  - pnpm build                    # Compile TypeScript + copy GraphQL schema
  - pnpm start                    # Start in production mode
- Code quality
  - pnpm lint                     # ESLint + Prettier (with auto-fix)
  - pnpm test                     # Run Jest test suites
  - pnpm test:coverage            # Tests with coverage report
  - npx tsc --noEmit              # TypeScript type checking
- Database (Prisma)
  - pnpm db:pull                  # Pull DB schema into Prisma schema
  - pnpm db:generate              # Generate Prisma client
  - pnpm db:studio                # Prisma Studio GUI
  - pnpm db:migrate               # Create new migration
  - pnpm db:deploy                # Apply migrations to DB
  - pnpm db:migrate-reset         # Reset DB (destructive)
  - pnpm db:seed-master           # Seed master data (e.g., cities, states)
  - pnpm db:seed-domain           # Seed domain data (e.g., users, communities)
- GraphQL
  - pnpm gql:generate             # Generate GraphQL types (codegen.yaml)
- Docker
  - pnpm container:up             # Start PostgreSQL container (port 15432)
  - pnpm container:down           # Stop and remove container(s)

6) Testing Strategy
- Test types
  - Unit tests for services and business logic
  - Integration tests for end-to-end flows where needed
  - Authentication tests focusing on token verification and context
- Patterns and tools
  - Jest + TypeScript, Prisma Fabbrica factories for test data
  - Mocks and stubs for infrastructure dependencies
- Running tests
  - pnpm test
  - By category:
    - pnpm test -- --testPathPattern=unit
    - pnpm test -- --testPathPattern=integration
    - pnpm test -- --testPathPattern=auth
  - Watch mode:
    - npx jest --watch
- Current test health snapshot
  - 303/303 tests passing, 45/45 suites passing (unit coverage highlight in reports)

7) Security and Access Control
- Multi-layer security model
  1. Authentication (Firebase token verification)
  2. GraphQL authorization (schema-level guards)
  3. Row-level security and data access constraints
  4. Domain-level access control in business logic
- Request flow
  - Middleware verifies token, loads identity, and constructs user context
  - Role and permissions are then applied per community and resource
- Developer notes
  - Ensure tokens are validated per environment configuration
  - Do not leak sensitive data through logs
  - Validate authorization at both API and business logic layers where appropriate

8) Deployment and CI/CD
- CI
  - PRs run linting, type checks, and tests
  - Build and packaging steps where applicable
- CD (Production)
  - GitHub Actions deploy to Google Cloud Run
  - Service topology typically includes:
    - Internal API
    - External API
    - Batch jobs
- Typical production flow
  - Merge to target branch → CI build → container images → deploy to Cloud Run
- Developer checklist before deployment
  - Tests green and coverage acceptable
  - Migrations verified and safe for production
  - Environment variables configured on the platform (never hard-coded)

9) Troubleshooting and Performance
- Common issues and quick checks
  - Database container not starting or port conflicts
    - Check port 15432 in use
    - Remove old containers/volumes if necessary
  - Database connection errors
    - Verify DATABASE_URL format and credentials
    - Use Prisma Studio or psql to validate connectivity
  - Migration problems and schema drift
    - Reset/generate/deploy in correct order
  - Firebase authentication errors
    - Confirm environment variables and correct private key newline escaping
  - GraphQL code generation or schema errors
    - Run pnpm gql:generate and fix type mismatches
- Performance tips
  - Add logging for long transactions; consider splitting large transactions
  - Monitor Prisma query logs during heavy operations
  - Use appropriate indexes and validate query plans where needed

10) Change Management and Quality Assurance
- Quality loop in practice
  - Address root causes (e.g., transaction timeouts, BigInt serialization, async flow issues)
  - Improve tests and monitoring to prevent regressions
- Recent outcomes (from reports)
  - Test success improved from 70% → 100%
  - Stability improved across database, auth, and async operations
- Best practices
  - Keep fixes small and verifiable
  - Add or update tests for each change
  - Document operational impacts and required follow-ups

11) Appendix
- ERD: see ../ERD.md
- Glossary
  - DDD: Domain-Driven Design
  - RLS: Row-Level Security
  - VC: Verifiable Credential
  - DID: Decentralized Identifier
- Quick links (handbook)
  - Development: ../handbook/DEVELOPMENT.md
  - Testing: ../handbook/TESTING.md
  - Security: ../handbook/SECURITY.md
  - Deployment: ../handbook/DEPLOYMENT.md
  - Commands: ../handbook/COMMANDS.md
  - Environment: ../handbook/ENVIRONMENT.md
  - Troubleshooting: ../handbook/TROUBLESHOOTING.md

Provenance and consolidation
- Translated and condensed content from Japanese sources:
  - docs/handbook/ARCHITECTURE.md
  - docs/handbook/ENVIRONMENT.md
  - docs/handbook/COMMANDS.md
  - docs/handbook/TROUBLESHOOTING.md
  - Context from docs/handbook/FEATURES.md
- Integrated existing English sources:
  - docs/handbook/DEVELOPMENT.md, TESTING.md, SECURITY.md, DEPLOYMENT.md, PERFORMANCE.md
  - docs/report/bug_fixes.md, docs/report/202504_unit.md
