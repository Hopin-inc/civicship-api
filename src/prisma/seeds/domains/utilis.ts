export async function processInBatches<T>(
  items: T[],
  batchSize: number,
  callback: (batch: T[]) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await callback(batch);
  }
}
