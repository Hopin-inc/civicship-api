FROM node:20 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /tmp

COPY package.json pnpm-lock.yaml* ./
RUN yarn global add pnpm && pnpm i --frozen-lockfile;

FROM base AS builder
WORKDIR /tmp
COPY --from=base /tmp/node_modules ./node_modules
COPY . .

RUN pnpm build
CMD ["pnpm", "start"]
