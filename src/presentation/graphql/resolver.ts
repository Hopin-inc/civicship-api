import path from "path";
import { fileURLToPath } from "url";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolversArray = loadFilesSync(path.resolve(__dirname, "../../application/**/resolver.ts"));
const resolvers = mergeResolvers([...resolversArray]);

export default resolvers;
