import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import IdentityPresenter from "@/application/domain/account/identity/presenter";
import { identitySelectDetail } from "@/application/domain/account/identity/data/type";
import { GqlIdentity } from "@/types/graphql";

async function batchIdentitiesByUid(
  issuer: PrismaClientIssuer,
  uids: readonly string[],
): Promise<(GqlIdentity | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.identity.findMany({
      where: { uid: { in: [...uids] } },
      select: identitySelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.uid, IdentityPresenter.get(record)]));

  return uids.map((uid) => map.get(uid) ?? null);
}

export function createIdentityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlIdentity | null>((keys) => batchIdentitiesByUid(issuer, keys));
}
