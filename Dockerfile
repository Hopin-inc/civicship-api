FROM node:20
WORKDIR /tmp
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . ./
RUN pnpm db:generate
RUN pnpm build
CMD ["pnpm", "start"]
