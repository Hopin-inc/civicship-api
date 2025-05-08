import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
// TODO: identity用のGraphQL型を定義する（例: GqlIdentity）
import IdentityPresenter from "@/application/domain/account/identity/presenter";
// TODO: identitySelectDetailをdata/type.tsに定義する
import { identitySelectDetail } from "@/application/domain/account/identity/data/type";

/**
 * uidの配列からIdentityをまとめて取得し、GraphQL型に変換して返す
 */
async function batchIdentitiesByUid(
  issuer: PrismaClientIssuer,
  uids: readonly string[],
): Promise<(any | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.identity.findMany({
      where: { uid: { in: [...uids] } },
      select: identitySelectDetail,
    });
  });

  // TODO: IdentityPresenter.get を実装し、Prisma型→GraphQL型に変換する
  const map = new Map(records.map((record) => [record.uid, IdentityPresenter.get(record)]));

  return uids.map((uid) => map.get(uid) ?? null);
}

/**
 * Identity用DataLoaderを生成
 */
export function createIdentityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, any | null>((keys) => batchIdentitiesByUid(issuer, keys));
}
