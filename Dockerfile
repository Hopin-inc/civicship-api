# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the internal/main GraphQL API + batch job image.
#
# NOTE on build flow (see .dockerignore for full context):
#   The CI runner (.github/workflows/_deploy-cloud-run.yml) pre-builds
#   `node_modules/` (incl. Prisma TypedSQL artifacts that need a live DB
#   tunnel) and `dist/` BEFORE invoking `docker buildx build`. The builder
#   stage below therefore copies those pre-built artifacts from the build
#   context and only prunes node_modules to production deps. This keeps
#   the existing CI flow working while still giving us a small, non-root
#   runtime stage with a HEALTHCHECK and (optional) image-digest pin.
#
# NOTE on digest pinning:
#   The base image tag (`node:20-slim`) is intentionally not pinned to a
#   sha256 digest in this initial change — `docker pull` is unavailable in
#   the dev sandbox where this PR was authored. Digest pinning is tracked
#   as a follow-up (apply `node:20-slim@sha256:<digest>` once a known-good
#   digest is captured from CI / `docker buildx imagetools inspect`).

# ---------------------------------------------------------------------------
# Builder stage: take the pre-built workspace, prune dev dependencies.
# ---------------------------------------------------------------------------
FROM node:20-slim AS builder

WORKDIR /app

# corepack provides the `pnpm` shim so `pnpm prune` works without a global
# install. Pin the version to match `packageManager` in package.json.
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy lockfile + manifests first (small, rarely-changing layer).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Pre-built artifacts copied from the CI runner build context.
# (See file header comment for why these are pre-built rather than built
#  in-stage.)
COPY node_modules ./node_modules
COPY dist ./dist

# Drop devDependencies from node_modules so the runtime stage only carries
# what's needed at runtime. `--prod` keeps dependencies in the
# `dependencies` field; devDependencies are removed.
RUN pnpm prune --prod

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
COPY --chown=node:node tsconfig.json ./tsconfig.json

EXPOSE 3000

# HEALTHCHECK is ignored by Cloud Run (which uses its own startup/liveness
# probes), but it's useful for local debugging via `docker run` /
# docker-compose / any orchestrator that honours OCI HEALTHCHECK.
# Node 20 ships a global `fetch`, so no extra runtime dep is required.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# `-r tsconfig-paths/register` is required because the compiled output keeps
# `@/` path aliases (resolved via tsconfig paths at runtime).
CMD ["node", "-r", "tsconfig-paths/register", "dist/bootstrap/index.js"]
