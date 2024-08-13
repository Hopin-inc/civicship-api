import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { typeDefs } from "graphql-scalars";
import { applyMiddleware } from "graphql-middleware";
import { permissions } from "@/graphql/permissions";

const definedSchema = loadSchemaSync("./**/*.graphql", {
  loaders: [new GraphQLFileLoader()]
});
const schema = applyMiddleware(
  mergeSchemas({
    schemas: [
      definedSchema,
      makeExecutableSchema({ typeDefs })
    ]
  }),
  permissions
);

export default schema;
