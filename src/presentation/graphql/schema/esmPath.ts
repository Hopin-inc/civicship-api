import { fileURLToPath } from "url";
import path from "path";

export const getESMDirname = () => {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};
