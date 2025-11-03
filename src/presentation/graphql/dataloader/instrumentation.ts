import { getPerfAggregator } from "@/infrastructure/observability/als";

export function instrumentBatchFn<K, V>(
  name: string,
  batchFn: (keys: readonly K[]) => Promise<(V | Error)[]>
): (keys: readonly K[]) => Promise<(V | Error)[]> {
  return async (keys: readonly K[]) => {
    const start = performance.now();
    try {
      return await batchFn(keys);
    } finally {
      const duration = performance.now() - start;
      const aggregator = getPerfAggregator();
      if (aggregator) {
        aggregator.add("dataloader.batch", duration, {
          name,
          batchSize: keys.length,
          durationMs: Number(duration.toFixed(2)),
        });
      }
    }
  };
}
