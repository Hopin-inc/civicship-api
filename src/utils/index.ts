export function calculateDifferences<T>(existingIds: Set<T>, newIds?: T[]) {
  const toAdd = newIds?.filter((id) => !existingIds.has(id)) || [];
  const toRemove = [...existingIds].filter((id) => !newIds?.includes(id));
  return { toAdd, toRemove };
}
