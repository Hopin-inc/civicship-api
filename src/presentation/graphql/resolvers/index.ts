import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers } from "@graphql-tools/merge";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolversArray = loadFilesSync([path.join(__dirname, "*", "**", "*.ts")]);
const resolvers = mergeResolvers([...resolversArray]);

export default resolvers;
