import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema, mergeSchemas, addResolversToSchema } from "@graphql-tools/schema";
import { DateTimeTypeDefinition } from "graphql-scalars";
import { applyMiddleware } from "graphql-middleware";
import permissions from "src/presentation/graphql/permission";
import errorMiddleware from "@/presentation/middleware/error"; // 例: errorMiddleware がある場合
import resolvers from "@/presentation/graphql/resolver";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPaths = [
  path.join(__dirname, "../../../application/**/*.graphql"),
  path.join(__dirname, "../../../presentation/**/*.graphql"),
];
const definedSchema = loadSchemaSync(schemaPaths, {
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
