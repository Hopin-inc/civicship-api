FROM node:20
WORKDIR /tmp
COPY package*.json ./
COPY patches/ /tmp/patches/
RUN npm install -g pnpm
RUN pnpm install
COPY . ./
RUN pnpm build
CMD ["pnpm", "start"]
