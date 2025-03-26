import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { mergeSchemas, addResolversToSchema } from "@graphql-tools/schema";
import { DateTimeTypeDefinition } from "graphql-scalars";
import { applyMiddleware } from "graphql-middleware";
import errorMiddleware from "@/presentation/middleware/error";
import resolvers from "@/presentation/graphql/resolver";
import permissions from "@/presentation/graphql/permission";
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
  typeDefs: [DateTimeTypeDefinition],
});

let schema = mergeSchemas({
  schemas: [definedSchema],
});

schema = addResolversToSchema({
  schema,
  resolvers,
});

schema = applyMiddleware(schema, permissions, errorMiddleware);

export default schema;
