import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { DateTimeTypeDefinition } from "graphql-scalars";
import { applyMiddleware } from "graphql-middleware";
import errorMiddleware from "@/presentation/middleware/error";
import resolvers from "@/presentation/graphql/resolver";
import { authZDirective } from "@graphql-authz/directive";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GraphQL ファイルの読み込み対象パス
const schemaPaths = [
  path.join(__dirname, "../../../application/**/*.graphql"),
  path.join(__dirname, "../../../presentation/**/*.graphql"),
];

// AuthZ Directive Transformer の取得
const { authZDirectiveTransformer } = authZDirective();

// スキーマの読み込み
const loadedSchema = loadSchemaSync(schemaPaths, {
  loaders: [new GraphQLFileLoader()],
});

// typeDefs をまとめて定義（scalar + loaded schema）
const typeDefs = [DateTimeTypeDefinition, loadedSchema];

// Executable Schema の作成
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// AuthZ Directive の適用
schema = authZDirectiveTransformer(schema);

// エラーハンドリング Middleware の適用
schema = applyMiddleware(schema, errorMiddleware);

export default schema;
