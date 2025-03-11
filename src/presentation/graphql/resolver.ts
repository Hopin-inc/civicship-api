import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";
import path from "path";
import { fileURLToPath } from "url";
import { DecimalScalar } from "@/presentation/graphql/scalar/decimal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scalarResolvers = {
  Decimal: DecimalScalar,
};

const resolversArray = loadFilesSync([path.join(__dirname, "../../application/**/resolver.ts")]);
const resolvers = mergeResolvers([scalarResolvers, ...resolversArray]);

export default resolvers;
