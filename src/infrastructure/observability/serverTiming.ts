export function buildServerTimingHeader(summary: Record<string, unknown>): string {
  const entries: string[] = [];

  if (summary["graphql.total"]) {
    const total = summary["graphql.total"] as { totalMs: number };
    entries.push(`total;dur=${total.totalMs.toFixed(2)}`);
  }

  if (summary["graphql.execute"]) {
    const exec = summary["graphql.execute"] as { totalMs: number };
    entries.push(`gql;dur=${exec.totalMs.toFixed(2)}`);
  }

  if (summary["db.operation"]) {
    const db = summary["db.operation"] as { totalMs: number };
    entries.push(`db;dur=${db.totalMs.toFixed(2)}`);
  }

  if (summary["http.external"]) {
    const http = summary["http.external"] as { totalMs: number };
    entries.push(`ext;dur=${http.totalMs.toFixed(2)}`);
  }

  if (summary["dataloader.batch"]) {
    const dl = summary["dataloader.batch"] as { totalMs: number };
    entries.push(`dl;dur=${dl.totalMs.toFixed(2)}`);
  }

  if (summary["resolver.root"]) {
    const resolvers = summary["resolver.root"] as {
      top: Array<{ name: string; durationMs: number }>;
    };
    resolvers.top.slice(0, 2).forEach((r) => {
      entries.push(`r:${r.name};dur=${r.durationMs.toFixed(2)}`);
    });
  }

  return entries.join(", ");
}
