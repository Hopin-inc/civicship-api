import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { typeDefs } from "graphql-scalars";

const definedSchema = loadSchemaSync("./**/*.graphql", {
  loaders: [new GraphQLFileLoader()]
});
const schema = mergeSchemas({
  schemas: [
    definedSchema,
    makeExecutableSchema({ typeDefs })
  ]
});

export default schema;
