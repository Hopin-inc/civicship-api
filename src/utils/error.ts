/**
 * Returns the `.code` field of an unknown caught error if it is a string,
 * otherwise undefined. Avoids unsafe `as` casts in catch blocks.
 */
export function getErrorCode(err: unknown): string | undefined {
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof err.code === "string"
  ) {
    return err.code;
  }
  return undefined;
}

/**
 * Coerces an unknown caught value into an Error. If it is already an Error,
 * returns it as-is; otherwise wraps it in a new Error preserving the original
 * value as the message.
 */
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
