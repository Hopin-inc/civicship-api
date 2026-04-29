FROM node:20
WORKDIR /app
COPY . ./
CMD ["node", "-r", "tsconfig-paths/register", "dist/bootstrap/index.js"]
