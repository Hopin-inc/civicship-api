import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema, mergeSchemas, addResolversToSchema } from "@graphql-tools/schema";
import { DateTimeTypeDefinition } from "graphql-scalars";
import { applyMiddleware } from "graphql-middleware";
import permissions from "@/presentation/graphql/permissions";
import errorMiddleware from "@/presentation/middleware/error"; // 例: errorMiddleware がある場合
import resolvers from "@/presentation/graphql/resolvers";

const definedSchema = loadSchemaSync("./**/*.graphql", {
  loaders: [new GraphQLFileLoader()],
});

let schema = mergeSchemas({
  schemas: [
    definedSchema,
    makeExecutableSchema({
      typeDefs: [DateTimeTypeDefinition],
    }),
  ],
});

schema = addResolversToSchema({
  schema,
  resolvers,
});

schema = applyMiddleware(schema, permissions, errorMiddleware);
export default schema;
