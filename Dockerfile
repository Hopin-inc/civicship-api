FROM node:20
WORKDIR /tmp
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . ./
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN prisma generate
RUN pnpm db:generate
RUN pnpm build
CMD ["pnpm", "start"]
