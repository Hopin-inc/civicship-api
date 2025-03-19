import http from "http";
import { createServer } from "https";
import fs from "fs";
import { createExpressApp } from "@/presentation/app";
import { createApolloServer } from "@/presentation/graphql/server";
import logger from "@/infrastructure/logging";
import { authHandler } from "@/presentation/middleware/auth";
import lineRouter from "@/presentation/router/line";
import { batchProcess } from "@/batch";

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  const app = createExpressApp();

  let server: http.Server;
  if (process.env.NODE_HTTPS === "true") {
    server = createServer(
      {
        key: fs.readFileSync("./certificates/localhost-key.pem"),
        cert: fs.readFileSync("./certificates/localhost.pem"),
      },
      app,
    );
  } else {
    server = http.createServer(app);
  }

  const apolloServer = await createApolloServer(server);

  app.use("/graphql", authHandler(apolloServer));
  app.use("/line", lineRouter);

  server.listen(port, () => {
    logger.info(`🚀 Server ready at port ${port}`);
  });
}

async function main() {
  if (process.env.PROCESS_TYPE === "batch") {
    await batchProcess();
  } else {
    await startServer();
  }
}

main();
