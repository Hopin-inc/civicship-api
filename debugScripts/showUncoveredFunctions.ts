// scripts/show-uncovered-functions.ts
import * as fs from "fs";

const coverage = JSON.parse(fs.readFileSync("./coverage/coverage-final.json", "utf8"));

const shouldInclude = (path: string) => path.includes("/service") || path.includes("/validator");

for (const [filePath, fileData] of Object.entries<any>(coverage)) {
  // service / validator に関係ないファイルはスキップ
  if (!shouldInclude(filePath)) {
    continue;
  }

  const functions = fileData.fnMap;
  const hits = fileData.f;

  for (const [id, fn] of Object.entries<any>(functions)) {
    if (hits[id] === 0) {
      console.log(`[UNCOVERED] ${filePath} -> ${fn.name} (Line ${fn.loc.start.line})`);
    }
  }
}
