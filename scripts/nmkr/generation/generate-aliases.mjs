import fs from "node:fs";
import path from "node:path";

const opsPath = path.resolve("src/infrastructure/libs/nmkr/types/types.operations.d.ts");
const outPath = path.resolve("src/infrastructure/libs/nmkr/types/types.aliases.d.ts");

if (!fs.existsSync(opsPath)) {
  console.error(`Operations file not found: ${opsPath}`);
  process.exit(1);
}

const ops = fs.readFileSync(opsPath, "utf8");

// Extract all exported type names from types.operations.d.ts
const exported = Array.from(ops.matchAll(/export\s+type\s+(\w+)\s*=/g)).map((m) => m[1]); // e.g., GetGetPayoutWalletsApikey_g7h8i9Response

// Partial match picker function
function pickOp({ includes = [], suffix }) {
  const needle = includes.map((s) => s.toLowerCase());
  const cand = exported.filter((name) => {
    const n = name.toLowerCase();
    return needle.every((part) => n.includes(part)) && n.endsWith(suffix.toLowerCase());
  });
  if (cand.length === 0) return null;
  // Sort by length and lexicographically for consistent results
  cand.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return cand[0];
}

// Only generate aliases for actually used operations - streamlined for 2 methods only
const tryOps = {
  // GetAddressForSpecificNftSale (correct endpoint for createSpecificNftSale)
  // This is used by createSpecificNftSale method
  CreatePaymentTransactionRequestBody: pickOp({
    includes: ["getaddressforspecificnftsale", "apikey", "nftprojectid"],
    suffix: "RequestBody",
  }),
  CreatePaymentTransactionResponse: pickOp({
    includes: ["getaddressforspecificnftsale", "apikey", "nftprojectid"],
    suffix: "Response",
  }),

  // Note: All other operations removed as they are not used by the 2 active NMKR methods
  // Only keeping essential types for createWallet and createSpecificNftSale
};

// Helper function to add alias or paths fallback
function aliasOrPaths(alias, opsName, pathsType) {
  if (opsName) {
    return `export type ${alias} = ${opsName};`;
  } else {
    console.warn(`Warning: ${alias} not found in operations, using paths fallback`);
    return `export type ${alias} = ${pathsType};`;
  }
}

// Build output
const out = [];
out.push("/* eslint-disable */");
out.push("// @generated - DO NOT EDIT");
out.push("// Auto-generated stable type aliases for NMKR API operations");
out.push("");
out.push("import type { paths, components } from './openapi';");
out.push("");

// Collect imports for found operation types
const foundOpsTypes = Object.values(tryOps).filter(Boolean);
if (foundOpsTypes.length > 0) {
  out.push("import type {");
  foundOpsTypes.forEach((type, i) => {
    out.push(`  ${type}${i < foundOpsTypes.length - 1 ? "," : ""}`);
  });
  out.push("} from './types.operations';");
  out.push("");
}

// Generate aliases with paths fallback - streamlined for only used operations
out.push("// Payment transactions - used by createSpecificNftSale");
out.push(
  aliasOrPaths(
    "CreatePaymentTransactionRequestBody",
    tryOps.CreatePaymentTransactionRequestBody,
    'paths["/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}"]["post"]["requestBody"]["content"]["application/json"]',
  ),
);
out.push(
  aliasOrPaths(
    "CreatePaymentTransactionResponse",
    tryOps.CreatePaymentTransactionResponse,
    'paths["/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}"]["post"]["responses"]["200"]["content"]["application/json"]',
  ),
);

out.push("");
out.push("// Re-export components for convenience");
out.push('export type { components } from "./openapi";');

fs.writeFileSync(outPath, out.join("\n") + "\n", "utf8");
console.log(
  `✔ Generated ${outPath} with stable type aliases (${foundOpsTypes.length} from operations, rest from paths fallback)`,
);
console.log("ops-resolved count:", foundOpsTypes.length);
for (const t of foundOpsTypes.sort()) console.log("  -", t);
