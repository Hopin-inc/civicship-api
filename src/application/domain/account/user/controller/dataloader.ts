import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlUser } from "@/types/graphql";
import UserPresenter from "@/application/domain/account/user/presenter";
import { userSelectDetail } from "@/application/domain/account/user/data/type";

async function batchUsersById(
  issuer: PrismaClientIssuer,
  userIds: readonly string[],
): Promise<(GqlUser | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.user.findMany({
      where: { id: { in: [...userIds] } },
      select: userSelectDetail,
    });
  });

  const userMap = new Map(records.map((record) => [record.id, UserPresenter.get(record)]));
  return userIds.map((id) => userMap.get(id) ?? null);
}

export function createUserLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUser | null>((keys) => batchUsersById(issuer, keys));
}
