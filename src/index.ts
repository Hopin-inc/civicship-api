import { startStandaloneServer } from "@apollo/server/standalone";
import graphqlServer from "./graphql";

const { url } = await startStandaloneServer(graphqlServer, {
  listen: { port: Number(process.env.PORT ?? 3000) },
});

console.log(`🚀 Server ready at: ${ url }`);
