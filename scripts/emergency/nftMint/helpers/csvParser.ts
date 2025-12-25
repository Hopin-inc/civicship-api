import * as fs from "fs";
import logger from "../../../../src/infrastructure/logging";
import { InputRecord } from "../types";
import { normalizeAndLogPhoneNumber } from "./phoneNormalizer";

export function parseInputCsv(csvContent: string): InputRecord[] {
  const lines = csvContent.trim().split("\n");

  if (lines.length < 2) {
    return [];
  }

  return lines
    .slice(1)
    .map((line, index) => {
      const lineNumber = index + 2;
      const [rawPhoneNumber, nftSequence, name] = line.split(",").map((s) => s.trim());
      if (!rawPhoneNumber || !nftSequence) {
        logger.warn(`Invalid CSV line ${lineNumber}: ${line}`);
        return null;
      }

      const normalized = normalizeAndLogPhoneNumber(rawPhoneNumber, lineNumber);
      if (!normalized.ok) {
        return null;
      }

      return {
        phoneNumber: normalized.e164,
        nftSequence: parseInt(nftSequence, 10),
        name: name || "",
      };
    })
    .filter((r): r is InputRecord => r !== null);
}

export function loadInputCsv(filePath: string): InputRecord[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input CSV not found at ${filePath}`);
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const records = parseInputCsv(csvContent);

  if (records.length === 0) {
    throw new Error("Input CSV is empty or has no valid data rows");
  }

  logger.info(`Loaded ${records.length} records from input CSV`);
  return records;
}
