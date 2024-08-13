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

const app = express();
const httpServer = http.createServer(app);

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const graphqlServer = new ApolloServer<Context>({
  schema: schemaWithResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
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
          uid: null
        };
      }
    }
  })
);

const port = Number(process.env.PORT ?? 3000);
await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:${ port }/graphql`);

function getIdTokenFromRequest(req: http.IncomingMessage) {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer (.*)/, "$1");
}
