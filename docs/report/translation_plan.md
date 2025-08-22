# Translation Plan (Handbook and Reports)

Purpose
- Provide a clear, prioritized plan to translate Japanese documentation into English for external submission and contributor onboarding.

Scope
- Focus on docs under docs/handbook/*.md that are currently Japanese-only or primarily Japanese.
- Complementary: ensure report docs are ready for external sharing.

Priorities
- P0: Translate before external submission; blocks self-contained understanding for new contributors.
- P1: Important for smooth development, but can follow P0 shortly after.
- P2: Nice-to-have for completeness, lower immediate impact.

Inventory and Priorities
- P0
  - docs/handbook/ENVIRONMENT.md
    - Why: Essential to run the project locally; environment variables and secrets guidance are required for any developer.
    - Notes: Keep examples with placeholders; avoid exposing real secrets.
  - docs/handbook/ARCHITECTURE.md
    - Why: Explains DDD + Clean Architecture; critical for understanding domain boundaries and layering.
    - Notes: Condense repetitive sections; align terminology with report.
  - docs/handbook/COMMANDS.md
    - Why: Central reference for daily workflows (dev, lint/test, Prisma, Docker, GraphQL).
    - Notes: Ensure command names match package.json scripts; add short, plain-English descriptions.
  - docs/handbook/TROUBLESHOOTING.md
    - Why: Unblocks common local issues (DB, Prisma, Firebase, GraphQL); reduces onboarding friction.
    - Notes: Keep actionable, step-based fixes; include common port and path pitfalls.

- P1
  - docs/handbook/FEATURES.md
    - Why: Provides useful context on domain capabilities and API scope.
    - Notes: Keep concise; focus on definitions and relationships to domains.
  - docs/handbook/INFRASTRUCTURE.md
    - Why: Explains integration points and external systems used by backend.
    - Notes: Avoid sensitive configuration; reference public options where possible.

- P2
  - docs/handbook/PERFORMANCE.md
    - Why: Helpful for advanced tuning; not required for basic contribution.
    - Notes: Keep patterns and query tips; add references to metrics/logging.
  - docs/handbook/PATTERNS.md
    - Why: Useful guidance; lower urgency than architecture and commands.
    - Notes: Ensure examples are up-to-date with current code patterns.

Already in English (polish for consistency as needed)
- docs/handbook/DEVELOPMENT.md
- docs/handbook/TESTING.md
- docs/handbook/SECURITY.md
- docs/handbook/DEPLOYMENT.md
- docs/report/bug_fixes.md
- docs/report/202504_unit.md

Process and Deliverables
- Workflow
  1) Create draft PRs translating P0 items first.
  2) Keep translations concise; avoid duplicating full context already covered in the report (docs/report/backend_development_process.md).
  3) Add internal cross-links between translated docs and the report for discoverability.

- Quality checks
  - Terminology consistency: DDD, Clean Architecture, RLS, roles/permissions.
  - Command accuracy: verify against package.json and scripts.
  - Secrets hygiene: placeholders only; no real keys or tokens.

External Submission Readiness
- Ship order
  1) docs/report/backend_development_process.md (already added)
  2) P0 translations: ENVIRONMENT, COMMANDS (curated), ARCHITECTURE (condensed), TROUBLESHOOTING
  3) Optional: FEATURES (context), INFRASTRUCTURE
  4) Optional: PERFORMANCE, PATTERNS

- Reviewer checklist
  - Self-contained instructions to run locally
  - Clear workflow and command set
  - Security precautions noted (no secrets)
  - Troubleshooting for common blockers
