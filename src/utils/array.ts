type ProcessFunction<T, R> = (item: T) => Promise<R>;

export const processInBatches = async <T, R>(
  array: T[],
  batchSize: number,
  processFunction: ProcessFunction<T, R>,
): Promise<R[]> => {
  const results: R[] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);
    // バッチを順番に処理
    const batchResults = await Promise.all(batch.map(processFunction));
    results.push(...batchResults);
  }
  return results;
};
