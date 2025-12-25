import logger from "../../../../src/infrastructure/logging";

export type PhoneType = "mobile" | "landline";

export type PhoneNormalizeSuccess = {
  ok: true;
  e164: string;
  national: string;
  type: PhoneType;
};

export type PhoneNormalizeErrorCode =
  | "empty"
  | "no_digits"
  | "invalid_prefix"
  | "too_short"
  | "too_long"
  | "unsupported_11_digit_prefix";

export type PhoneNormalizeFailure = {
  ok: false;
  errorCode: PhoneNormalizeErrorCode;
  message: string;
  original: string;
  digits: string;
};

export type PhoneNormalizeResult = PhoneNormalizeSuccess | PhoneNormalizeFailure;

function convertFullWidthToHalfWidth(str: string): string {
  return str
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[ー−‐―]/g, "-")
    .replace(/＋/g, "+");
}

export function normalizeJapanesePhoneNumber(raw: string): PhoneNormalizeResult {
  const original = raw;
  const trimmed = raw.trim();

  if (!trimmed) {
    return {
      ok: false,
      errorCode: "empty",
      message: "電話番号が空です",
      original,
      digits: "",
    };
  }

  const halfWidth = convertFullWidthToHalfWidth(trimmed);
  const digits = halfWidth.replace(/[^\d]/g, "");

  if (!digits) {
    return {
      ok: false,
      errorCode: "no_digits",
      message: `電話番号に数字が含まれていません: "${original}"`,
      original,
      digits,
    };
  }

  if (!digits.startsWith("0")) {
    return {
      ok: false,
      errorCode: "invalid_prefix",
      message: `日本の電話番号は0で始まる必要があります: "${digits}"`,
      original,
      digits,
    };
  }

  if (digits.length < 10) {
    return {
      ok: false,
      errorCode: "too_short",
      message: `桁数が不足しています（10桁または11桁が必要、現在${digits.length}桁）: "${digits}"`,
      original,
      digits,
    };
  }

  if (digits.length > 11) {
    return {
      ok: false,
      errorCode: "too_long",
      message: `桁数が多すぎます（10桁または11桁が必要、現在${digits.length}桁）: "${digits}"`,
      original,
      digits,
    };
  }

  if (digits.length === 11) {
    const prefix3 = digits.slice(0, 3);
    if (!["070", "080", "090"].includes(prefix3)) {
      return {
        ok: false,
        errorCode: "unsupported_11_digit_prefix",
        message: `11桁の電話番号は070/080/090で始まる必要があります（現在: ${prefix3}）: "${digits}"`,
        original,
        digits,
      };
    }

    const e164 = `+81${digits.slice(1)}`;
    return {
      ok: true,
      e164,
      national: digits,
      type: "mobile",
    };
  }

  const e164 = `+81${digits.slice(1)}`;
  return {
    ok: true,
    e164,
    national: digits,
    type: "landline",
  };
}

export function normalizeAndLogPhoneNumber(
  raw: string,
  lineNumber: number,
): PhoneNormalizeResult {
  const result = normalizeJapanesePhoneNumber(raw);

  if (!result.ok) {
    logger.warn(`電話番号バリデーションエラー (CSV行 ${lineNumber})`, {
      errorCode: result.errorCode,
      message: result.message,
      original: result.original,
      digits: result.digits,
    });
  }

  return result;
}
