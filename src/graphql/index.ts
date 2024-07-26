import { ApolloServer } from "@apollo/server";
import { addResolversToSchema } from "@graphql-tools/schema";
import resolvers from "./resolvers";
import schema from "./schema";

// TODO NOT response Field suggestion on production
const schemaWithResolvers = addResolversToSchema({ schema, resolvers });
const graphqlServer = new ApolloServer({ schema: schemaWithResolvers });

export default graphqlServer;
