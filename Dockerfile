FROM node:20
WORKDIR /app
RUN npm install -g pnpm@10.33.0
COPY . ./
RUN pnpm build
CMD ["pnpm", "start"]
