import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/prisma/client";
import { GqlUser } from "@/types/graphql";
import UserOutputFormat from "@/domains/user/presenter/output";
import { userInclude } from "@/domains/user/type";

async function batchUsersById(
  issuer: PrismaClientIssuer,
  userIds: readonly string[],
): Promise<(GqlUser | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.user.findMany({
      where: { id: { in: [...userIds] } },
      include: userInclude,
    });
  });

  const userMap = new Map(records.map((record) => [record.id, UserOutputFormat.get(record)]));
  return userIds.map((id) => userMap.get(id) ?? null);
}

export function createUserLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUser | null>((keys) => batchUsersById(issuer, keys));
}
