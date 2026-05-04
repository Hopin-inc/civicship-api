# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the internal/main GraphQL API + batch job image.
#
# NOTE on build flow (see .dockerignore for full context):
#   The CI runner (.github/workflows/_deploy-cloud-run.yml) pre-builds
#   `node_modules/` (incl. Prisma TypedSQL artifacts that need a live DB
#   tunnel) and `dist/` BEFORE invoking `docker buildx build`. The builder
#   stage below copies those pre-built artifacts from the build context.
#
#   We deliberately **do not** run `pnpm prune --prod` inside the builder
#   stage. `pnpm prune --prod` rewrites `node_modules/.pnpm/` and removes
#   any "untracked" content from package directories — this includes the
#   generator output written by `prisma generate --sql` (e.g.
#   `node_modules/.pnpm/@prisma+client@.../node_modules/.prisma/client/sql/`),
#   which is required at runtime by callers of `@prisma/client/sql`
#   (verified in src/application/domain/{transaction,report}/...).
#
#   The image cost of shipping devDependencies is acceptable for now;
#   future optimization options are tracked in DEPLOYMENT.md (e.g.
#   regenerate `prisma generate --sql` from inside the runtime stage with
#   a jumpbox tunnel, or pre-bake a tarball of just the runtime tree).
#
# NOTE on digest pinning:
#   The base image tag (`node:20-slim`) is intentionally not pinned to a
#   sha256 digest in this initial change — `docker pull` is unavailable in
#   the dev sandbox where this PR was authored. Digest pinning is tracked
#   as a follow-up (apply `node:20-slim@sha256:<digest>` once a known-good
#   digest is captured from CI / `docker buildx imagetools inspect`).

# ---------------------------------------------------------------------------
# Builder stage: take the pre-built workspace as-is.
# ---------------------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Copy lockfile + manifests first (small, rarely-changing layer).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Pre-built artifacts copied from the CI runner build context.
# (See file header comment for why these are pre-built rather than built
#  in-stage, and why we don't run `pnpm prune --prod` here.)
COPY node_modules ./node_modules
COPY dist ./dist

# ---------------------------------------------------------------------------
# Runtime stage: minimal, non-root, HEALTHCHECK enabled.
# ---------------------------------------------------------------------------
FROM node:20-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# `node:20-slim` ships a `node` user (uid/gid 1000) created for exactly
# this purpose. Run the app as that user instead of root.
USER node

# Copy only what's needed at runtime, owned by the non-root user.
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 3000

# HEALTHCHECK is ignored by Cloud Run (which uses its own startup/liveness
# probes), but it's useful for local debugging via `docker run` /
# docker-compose / any orchestrator that honours OCI HEALTHCHECK.
# Node 20 ships a global `fetch`, so no extra runtime dep is required.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# `tsc-alias` (run during `pnpm build`) rewrites every `@/` import in `dist/`
# to a relative path, so `tsconfig-paths/register` is not needed at runtime.
# `tsconfig.json` is also dropped from the runtime stage for the same reason.
CMD ["node", "dist/bootstrap/index.js"]
