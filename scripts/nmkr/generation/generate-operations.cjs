// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require("crypto");

const schemaPath = path.resolve("src/infrastructure/libs/nmkr/schema/schema.mainnet.json");
const outPath = path.resolve("src/infrastructure/libs/nmkr/types/types.operations.d.ts");

if (!fs.existsSync(schemaPath)) {
  console.error(
    `[NMKR] ${schemaPath} がありません。先に 'pnpm nmkr:fetch:mainnet' を実行してください。`,
  );
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const lines = [];
lines.push(`// AUTO-GENERATED from paths by generate-operations.cjs. DO NOT EDIT.`);
lines.push(`import type { paths, components } from './openapi';`);
lines.push(`type P = paths;`);
lines.push(`type S = components['schemas'];`);
lines.push(``);

const pathsObj = schema.paths || {};
const methodKeys = ["get", "post", "put", "patch", "delete"];

// Whitelist of actually used operations - only generate types for these
const USED_OPERATIONS = new Set([
  "/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}", // Used by createSpecificNftSale (POST endpoint only)
  "/v2/CreateWallet/{customerid}", // Used by createWallet
]);

function isUsedOperation(url, method) {
  // For GetAddressForSpecificNftSale, only include POST method
  if (url === "/GetAddressForSpecificNftSale/{apikey}/{nftprojectid}") {
    return method === "post";
  }
  
  // For CreateWallet, include all methods
  if (url === "/v2/CreateWallet/{customerid}") {
    return true;
  }
  
  return false;
}

function toPascalCase(str) {
  return str.replace(/(?:^|[^a-zA-Z0-9])([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());
}

function tsNameFromOperation(opId, method, url) {
  if (opId && /^[A-Za-z0-9_]+$/.test(opId)) {
    return toPascalCase(opId);
  }
  // fallback: create stable name from method + url
  const urlName = url.replace(/[{}]/g, "").replace(/[^A-Za-z0-9]+/g, "_");
  const baseName = toPascalCase(method + "_" + urlName).replace(/_+/g, "");

  // Add short hash for uniqueness
  const hash = crypto
    .createHash("md5")
    .update(method + url)
    .digest("hex")
    .substring(0, 6);
  return `${baseName}_${hash}`;
}

function addType(name, expr, doc) {
  lines.push(`/** ${doc} */`);
  lines.push(`export type ${name} = ${expr};`);
  lines.push("");
}

function getPreferredContentType(content) {
  if (!content) return null;

  // Prefer application/json
  if (content["application/json"]) {
    return { type: "application/json", schema: content["application/json"] };
  }

  // Fallback to first available content type
  const firstKey = Object.keys(content)[0];
  if (firstKey) {
    return { type: firstKey, schema: content[firstKey] };
  }

  return null;
}

for (const [url, pathItem] of Object.entries(pathsObj)) {
  for (const method of methodKeys) {
    const op = pathItem?.[method];
    if (!op) continue;
    
    // Skip unused operations to reduce generated types
    if (!isUsedOperation(url, method)) {
      continue;
    }

    const opId = op.operationId || null;
    const baseName = tsNameFromOperation(opId, method, url);

    // Path Parameters
    const pathParams = op.parameters?.filter((p) => p.in === "path");
    if (pathParams && pathParams.length > 0) {
      const expr = `P['${url}']['${method}']['parameters']['path']`;
      addType(`${baseName}PathParams`, expr, `${method.toUpperCase()} ${url} path parameters`);
    }

    // Query Parameters
    const queryParams = op.parameters?.filter((p) => p.in === "query");
    if (queryParams && queryParams.length > 0) {
      const expr = `P['${url}']['${method}']['parameters']['query']`;
      addType(`${baseName}QueryParams`, expr, `${method.toUpperCase()} ${url} query parameters`);
    }

    // Header Parameters
    const headerParams = op.parameters?.filter((p) => p.in === "header");
    if (headerParams && headerParams.length > 0) {
      const expr = `P['${url}']['${method}']['parameters']['header']`;
      addType(`${baseName}HeaderParams`, expr, `${method.toUpperCase()} ${url} header parameters`);
    }

    // Request Body
    const requestBody = op.requestBody?.content;
    if (requestBody) {
      const contentInfo = getPreferredContentType(requestBody);
      if (contentInfo) {
        const expr = `P['${url}']['${method}']['requestBody']['content']['${contentInfo.type}']`;
        const contentNote = contentInfo.type !== "application/json" ? ` (${contentInfo.type})` : "";
        addType(
          `${baseName}RequestBody`,
          expr,
          `${method.toUpperCase()} ${url} request body${contentNote}`,
        );
      }
    }

    // Response handling
    const responses = op.responses || {};
    const successCodes = [];
    const errorCodes = [];

    for (const [code, response] of Object.entries(responses)) {
      const numCode = parseInt(code);
      if (numCode >= 200 && numCode < 300) {
        successCodes.push(code);
      } else if (numCode >= 400 || code === "default") {
        errorCodes.push(code);
      }

      // Individual response types
      const content = response.content;
      if (content) {
        const contentInfo = getPreferredContentType(content);
        if (contentInfo) {
          const expr = `P['${url}']['${method}']['responses']['${code}']['content']['${contentInfo.type}']`;
          const contentNote =
            contentInfo.type !== "application/json" ? ` (${contentInfo.type})` : "";
          addType(
            `${baseName}Response${code}`,
            expr,
            `${method.toUpperCase()} ${url} ${code} response${contentNote}`,
          );
        }
      }
    }

    // Success Response Union (2xx)
    if (successCodes.length > 0) {
      if (successCodes.length === 1) {
        addType(
          `${baseName}Response`,
          `${baseName}Response${successCodes[0]}`,
          `${method.toUpperCase()} ${url} success response`,
        );
      } else {
        const union = successCodes.map((code) => `${baseName}Response${code}`).join(" | ");
        addType(
          `${baseName}Response`,
          union,
          `${method.toUpperCase()} ${url} success response union`,
        );
      }
    }

    // Error Response Union (4xx/5xx)
    if (errorCodes.length > 0) {
      if (errorCodes.length === 1) {
        addType(
          `${baseName}Error`,
          `${baseName}Response${errorCodes[0]}`,
          `${method.toUpperCase()} ${url} error response`,
        );
      } else {
        const union = errorCodes.map((code) => `${baseName}Response${code}`).join(" | ");
        addType(`${baseName}Error`, union, `${method.toUpperCase()} ${url} error response union`);
      }
    }
  }
}

// Add convenience re-exports for commonly used types
lines.push(`// Convenience re-exports`);
lines.push(`export type { components, paths } from './openapi';`);
lines.push(``);

// Configuration constants
lines.push(`export const NMKR_CONFIG = {`);
lines.push(`  DEFAULT_TIMEOUT: 15000,`);
lines.push(`  MAX_RETRIES: 3,`);
lines.push(`  RETRY_DELAY_BASE: 1000,`);
lines.push(`} as const;`);

fs.writeFileSync(outPath, lines.join("\n"));
console.log(`[NMKR] wrote ${outPath}`);
