import http from "http";
import { createServer } from "https";
import fs from "fs";
import { createExpressApp } from "@/presen/app";
import { createApolloServer } from "@/presen/graphql/server";
import logger from "@/infra/logging";
import { authHandler } from "@/presen/middleware/auth";

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

  server.listen(port, () => {
    const protocol = process.env.NODE_HTTPS === "true" ? "https" : "http";
    const uri = `${protocol}://localhost:${port}/graphql`;
    logger.info(`🚀 Server ready at ${uri}`);
  });
}

startServer();
