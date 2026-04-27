export function isUpstreamTimeout(error: unknown): boolean {
  const code = (error as { code?: string } | null | undefined)?.code;
  if (code === "ETIMEDOUT") {
    return true;
  }
  if (error instanceof Error && error.message.startsWith("Request timeout")) {
    return true;
  }
  return false;
}
