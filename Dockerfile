FROM node:20
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm@10.33.0
RUN pnpm install --frozen-lockfile
COPY . ./
RUN pnpm build
CMD ["pnpm", "start"]
