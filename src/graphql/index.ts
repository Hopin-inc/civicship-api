import { ApolloServer } from "@apollo/server";
import { addResolversToSchema } from "@graphql-tools/schema";
import resolvers from "./resolvers";
import schema from "./schema";

const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const graphqlServer = new ApolloServer({ schema: schemaWithResolvers });

export default graphqlServer;
