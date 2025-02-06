export function clampFirst(first: number | null | undefined): number {
  if (typeof first === "number" && first > 100) {
    throw new Error("Too many items requested. Maximum is 100.");
  }

  return first ?? 10;
}
