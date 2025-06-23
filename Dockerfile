FROM node:20
ENV NODE_OPTIONS=--preserve-symlinks
WORKDIR /tmp
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . ./
RUN pnpm build
CMD ["pnpm", "start"]
