FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . ./
RUN pnpm build
CMD ["pnpm", "start"]
