import DataLoader from "dataloader";
import stringify from "json-stable-stringify";
import logger from "@/infrastructure/logging";

type RecordWithKey<K extends string> = Record<K, string | null>; // nullableの外部キーに対応（e.g. transaction.participation.id）
type RequestWithFilterAndSort<F, S> = { key: string; filter: F; sort: S };

//
// 単一リソース取得用の汎用DataLoader（id → 1件）
// 例: userId → User, reservationId → Reservation
//
export function createLoaderById<R extends { id: string }, G>(
  fetch: (ids: readonly string[]) => Promise<R[]>,
  format: (record: R) => G,
): DataLoader<string, G | null> {
  return new DataLoader<string, G | null>(async (ids) => {
    const records = await fetch(ids);
    const map = new Map<string, G>();

    for (const record of records) {
      map.set(record.id, format(record));
    }

    return ids.map((id) => map.get(id) ?? null);
  });
}

//
// 複合キーでリソース1件を取得（e.g. { userId, communityId } → Membership）
// 例: compositeKey → 1件、キーはjson-stable-stringifyでキャッシュされる
//
export function createLoaderByCompositeKey<K extends object, R, G>(
  fetch: (keys: readonly K[]) => Promise<R[]>,
  keyFn: (record: R) => K,
  format: (record: R) => G,
): DataLoader<K, G | null, string> {
  return new DataLoader<K, G | null, string>(
    async (keys) => {
      const records = await fetch(keys);
      const map = new Map<string, G>();

      for (const record of records) {
        const key = stringify(keyFn(record)) ?? "invalid";
        map.set(key, format(record));
      }

      return keys.map((key) => {
        const cacheKey = stringify(key) ?? "invalid";
        return map.get(cacheKey) ?? null;
      });
    },
    {
      cacheKeyFn: (key) => stringify(key) ?? "invalid",
    },
  );
}

//
// idがnullable（nullやundefined）の場合でも安全に扱えるLoader（例: evaluationId）
// 例: null → null, id → レコード or null
//
export function createNullableLoaderById<R extends { id: string }, G>(
  fetch: (ids: readonly string[]) => Promise<R[]>,
  format: (record: R) => G,
): DataLoader<string | null | undefined, G | null> {
  return new DataLoader(async (keys) => {
    const validKeys = keys.filter((k): k is string => !!k);
    const records = await fetch(validKeys);
    const map = new Map(records.map((r) => [r.id, format(r)]));
    return keys.map((k) => (k ? (map.get(k) ?? null) : null));
  });
}

//
// 1:N のリスト取得用（外部キー → 配列）
// 例: participationId → Transactions[], userId → Participations[]
//
export function createHasManyLoaderByKey<K extends string, R extends RecordWithKey<K>, G>(
  key: K,
  fetch: (keys: readonly string[]) => Promise<R[]>,
  format: (record: R) => G,
): DataLoader<string, G[]> {
  return new DataLoader<string, G[]>(async (keys) => {
    const records = await fetch(keys);
    const grouped = new Map<string, G[]>();

    for (const record of records) {
      const keyValue = record[key];
      if (!keyValue) {
        logger.warn("[HasManyLoader] record with missing key:", record);
        continue;
      }
      if (!grouped.has(keyValue)) grouped.set(keyValue, []);
      grouped.get(keyValue)!.push(format(record));
    }

    return keys.map((k) => grouped.get(k) ?? []);
  });
}

//
// N:Nリレーションにおける中間テーブル経由の汎用HasMany用DataLoader
// 例）participationId → Image[]（中間：_t_images_on_participations）
//
export function createHasManyLoaderViaJoin<K extends string, R, G>(
  keyField: K,
  fetch: (keys: readonly string[]) => Promise<Array<{ [key in K]: string } & { record: R }>>,
  format: (record: R) => G,
): DataLoader<string, G[]> {
  return new DataLoader<string, G[]>(async (keys) => {
    const joinedRecords = await fetch(keys);
    const grouped = new Map<string, G[]>();

    for (const item of joinedRecords) {
      const keyValue = item[keyField];
      if (!keyValue) continue;

      if (!grouped.has(keyValue)) grouped.set(keyValue, []);
      grouped.get(keyValue)!.push(format(item.record));
    }

    return keys.map((k) => grouped.get(k) ?? []);
  });
}

//
// 外部キー + filter + sort による 1:N リスト取得を最適化する汎用DataLoader
// 例: participationId + { status } + { createdAt: DESC } → [Transaction]
//
export function createFilterSortAwareHasManyLoaderByKey<
  K extends string,
  F extends object,
  S extends object,
  R extends RecordWithKey<K>,
  G,
>(
  keyField: K,
  fetch: (keyValue: string, filter: F, sort: S) => Promise<R[]>,
  format: (record: R) => G,
): DataLoader<RequestWithFilterAndSort<F, S>, G[], string> {
  return new DataLoader<RequestWithFilterAndSort<F, S>, G[], string>(
    async (requests) => {
      const grouped = new Map<string, RequestWithFilterAndSort<F, S>[]>();

      for (const request of requests) {
        const maybeKey = stringify(request);
        if (!maybeKey) continue;
        if (!grouped.has(maybeKey)) grouped.set(maybeKey, []);
        grouped.get(maybeKey)!.push(request);
      }

      const results = new Map<string, G[]>();

      for (const [cacheKey, group] of grouped.entries()) {
        if (!group.length || !group[0].key) {
          results.set(cacheKey, []);
          continue;
        }

        const { key: keyValue, filter, sort } = group[0];
        const records = await fetch(keyValue, filter, sort);
        results.set(cacheKey, records.map(format));
      }

      return requests.map((req) => {
        const cacheKey = stringify(req);
        if (!cacheKey) return [];
        return results.get(cacheKey) ?? [];
      });
    },
    {
      cacheKeyFn: (key) => stringify(key) ?? "invalid",
    },
  );
}
