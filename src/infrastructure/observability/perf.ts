export interface PerfMark {
  type: string;
  name: string;
  durationMs: number;
  meta?: Record<string, unknown>;
}

export class PerfAggregator {
  private marks: PerfMark[] = [];

  add(type: string, durationMs: number, meta?: Record<string, unknown>) {
    this.marks.push({
      type,
      name: (meta?.name as string) || type,
      durationMs,
      meta,
    });
  }

  summarize() {
    const byType: Record<
      string,
      { totalMs: number; count: number; marks: PerfMark[] }
    > = {};

    for (const mark of this.marks) {
      if (!byType[mark.type]) {
        byType[mark.type] = { totalMs: 0, count: 0, marks: [] };
      }
      byType[mark.type].totalMs += mark.durationMs;
      byType[mark.type].count += 1;
      byType[mark.type].marks.push(mark);
    }

    const summary: Record<string, unknown> = {};
    for (const [type, data] of Object.entries(byType)) {
      const topN = data.marks
        .sort((a, b) => b.durationMs - a.durationMs)
        .slice(0, 5)
        .map((m) => ({
          name: m.name,
          durationMs: Number(m.durationMs.toFixed(2)),
          ...m.meta,
        }));

      summary[type] = {
        totalMs: Number(data.totalMs.toFixed(2)),
        count: data.count,
        top: topN,
      };
    }

    return summary;
  }
}

export class PerfTracker {
  static async measure<T>(
    type: string,
    fn: () => Promise<T>,
    meta?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      const { getPerfAggregator } = await import("./als");
      const aggregator = getPerfAggregator();
      if (aggregator) {
        aggregator.add(type, duration, { ...meta, name: meta?.name || type });
      }
    }
  }
}
