FROM node:20
ENV NODE_OPTIONS=--preserve-symlinks
WORKDIR /tmp
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . ./
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN pnpm db:generate
RUN pnpm build
CMD ["pnpm", "start"]
