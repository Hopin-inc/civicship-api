import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import IdentityPresenter from "@/application/domain/account/identity/presenter";
import {
  identitySelectDetail,
  PrismaIdentityDetail,
} from "@/application/domain/account/identity/data/type";
import { GqlIdentity } from "@/types/graphql";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";

async function batchIdentitiesByUid(
  prisma: PrismaClient,
  uids: readonly string[],
): Promise<(GqlIdentity | null)[]> {
  const records = await prisma.identity.findMany({
    where: { uid: { in: [...uids] } },
    select: identitySelectDetail,
  });

  const map = new Map(records.map((record) => [record.uid, IdentityPresenter.get(record)]));

  return uids.map((uid) => map.get(uid) ?? null);
}

export function createIdentityLoader(prisma: PrismaClient) {
  return new DataLoader<string, GqlIdentity | null>((keys) => batchIdentitiesByUid(prisma, keys));
}

export function createIdentitiesByUserLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey<"userId", PrismaIdentityDetail, GqlIdentity>(
    "userId",
    async (userIds) => {
      return prisma.identity.findMany({
        where: { userId: { in: [...userIds] } },
      });
    },
    IdentityPresenter.get,
  );
}
