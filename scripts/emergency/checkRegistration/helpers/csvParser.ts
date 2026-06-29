import * as fs from "fs";
import logger from "@/infrastructure/logging";
import { normalizeJapanesePhoneNumber } from "../../nftMint/helpers/phoneNormalizer";
import { CheckInputRecord } from "../types";

/**
 * 入力電話番号を E.164 (+81...) に解決する。
 * - "+" 始まり: すでに E.164 とみなしてそのまま使う（前回の errors.csv は +81... 形式）
 * - それ以外: 日本の国内表記とみなして normalizeJapanesePhoneNumber で正規化
 */
export function resolveE164(
  raw: string,
): { ok: true; e164: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "電話番号が空です" };
  }

  if (trimmed.startsWith("+")) {
    const digits = trimmed.replace(/[^\d]/g, "");
    if (digits.length < 10) {
      return { ok: false, error: `桁数が不足しています: "${trimmed}"` };
    }
    return { ok: true, e164: `+${digits}` };
  }

  const normalized = normalizeJapanesePhoneNumber(trimmed);
  if (!normalized.ok) {
    return { ok: false, error: normalized.message };
  }
  return { ok: true, e164: normalized.e164 };
}

function splitCsvLine(line: string): string[] {
  // ダブルクオート対応の簡易CSVパース（前回 errors.csv の error 列がクオート囲み）
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

/**
 * ヘッダ行から列位置を特定してパースする。
 * 前回共有の errors.csv（phoneNumber,nftSequence,name,errorType,error）も
 * 元の input.csv（phoneNumber,nftSequence,name）も同じロジックで読める。
 *
 * 同一電話番号は1人として集約する（NFT連番が複数行に分かれていても人数で数えるため）。
 */
export function parseCheckCsv(csvContent: string): CheckInputRecord[] {
  const lines = csvContent.trim().split(/\r?\n/);
  if (lines.length < 2) {
    return [];
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const phoneIdx = header.indexOf("phonenumber");
  const nameIdx = header.indexOf("name");
  const seqIdx = header.indexOf("nftsequence");

  if (phoneIdx === -1) {
    throw new Error(`CSVヘッダに phoneNumber 列が見つかりません: "${lines[0]}"`);
  }

  // E.164 をキーに集約
  const byPhone = new Map<string, CheckInputRecord>();

  lines.slice(1).forEach((line, index) => {
    const lineNumber = index + 2;
    if (!line.trim()) {
      return;
    }

    const cols = splitCsvLine(line);
    const rawPhone = cols[phoneIdx] ?? "";
    const name = nameIdx !== -1 ? (cols[nameIdx] ?? "") : "";
    const rawSeq = seqIdx !== -1 ? (cols[seqIdx] ?? "") : "";

    const seq = /^[0-9]+$/.test(rawSeq) ? parseInt(rawSeq, 10) : null;

    const resolved = resolveE164(rawPhone);
    if (!resolved.ok) {
      // 生の電話番号は PII なので line 番号と理由のみ残す
      logger.warn(`電話番号を解決できませんでした (CSV行 ${lineNumber})`, {
        error: resolved.error,
      });
      // スキップせず invalidPhone として集計に残す（生値でキー化して重複排除）
      const key = `invalid:${rawPhone}`;
      const existingInvalid = byPhone.get(key);
      if (existingInvalid) {
        if (seq !== null && !existingInvalid.nftSequences.includes(seq)) {
          existingInvalid.nftSequences.push(seq);
        }
        return;
      }
      byPhone.set(key, {
        phoneNumber: rawPhone || "(empty)",
        name,
        nftSequences: seq !== null ? [seq] : [],
        invalidReason: resolved.error,
      });
      return;
    }

    const existing = byPhone.get(resolved.e164);
    if (existing) {
      if (!existing.name && name) {
        existing.name = name;
      }
      if (seq !== null && !existing.nftSequences.includes(seq)) {
        existing.nftSequences.push(seq);
      }
      return;
    }

    byPhone.set(resolved.e164, {
      phoneNumber: resolved.e164,
      name,
      nftSequences: seq !== null ? [seq] : [],
    });
  });

  return Array.from(byPhone.values());
}

/**
 * 指定パスのCSVを読み込み、パース済みの入力レコード配列を返す。
 * ファイルが無い、または有効な行が無い場合は例外を投げる。
 */
export function loadCheckCsv(filePath: string): CheckInputRecord[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`入力CSVが見つかりません: ${filePath}`);
  }

  const csvContent = fs.readFileSync(filePath, "utf-8");
  const records = parseCheckCsv(csvContent);

  if (records.length === 0) {
    throw new Error("入力CSVが空、または有効なデータ行がありません");
  }

  logger.info(`入力CSVから ${records.length} 件のユニーク電話番号を読み込みました`);
  return records;
}
