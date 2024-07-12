FROM node:20
WORKDIR /tmp
COPY package*.json ./
RUN pnpm
COPY . ./
RUN pnpm build
CMD ["pnpm", "start"]
