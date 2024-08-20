import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import schema from "@/graphql/schema";
import resolvers from "@/graphql/resolvers";
import { addResolversToSchema } from "@graphql-tools/schema";
import { Context } from "@/types/server";
import { auth } from "@/libs/firebase";
import { createServer } from "https";
import fs from "fs";

const app = express();
const httpServer = http.createServer(app);

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const graphqlServer = new ApolloServer<Context>({
  schema: schemaWithResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await graphqlServer.start();

app.use(
  "/graphql",
  cors(),
  express.json({ limit: "50mb" }),
  expressMiddleware(graphqlServer, {
    context: async ({ req }) => {
      const idToken = getIdTokenFromRequest(req);
      if (idToken) {
        const decoded = await auth.verifyIdToken(idToken);
        const uid = decoded?.uid;
        return { idToken, uid };
      } else {
        return {
          idToken: null,
          uid: null,
        };
      }
    },
  }),
  (req) => {
    console.log(req);
  },
);

const port = Number(process.env.PORT ?? 3000);
const server = process.env.NODE_HTTPS === "true"
  ? createServer({
    key: fs.readFileSync("./certificates/localhost-key.pem"),
    cert: fs.readFileSync("./certificates/localhost.pem"),
  }, app)
  : app;
server.listen(port, () => {
  const uri =
    process.env.ENV === "LOCAL"
      ? (process.env.NODE_HTTPS === "true" ? "https://" : "http://") + `localhost:${ port }/graphql`
      : `${ process.env.HOST }/graphql`;
  console.info(`🚀 Server ready at ${ uri }`);
  console.info(`Environment ${ process.env.ENV }`);
});

function getIdTokenFromRequest(req: http.IncomingMessage) {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer (.*)/, "$1");
}
