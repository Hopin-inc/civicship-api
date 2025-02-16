import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlMembership } from "@/types/graphql";
import MembershipOutputFormat from "@/presentation/graphql/dto/membership/output";
import { membershipInclude } from "@/infrastructure/prisma/types/membership";

async function batchMembershipsByCompositeKey(
  issuer: PrismaClientIssuer,
  keys: readonly string[],
): Promise<(GqlMembership | null)[]> {
  const pairs = keys.map((k) => {
    const [userId, communityId] = k.split(":");
    return { userId, communityId };
  });

  const records = await issuer.internal(async (tx) => {
    return tx.membership.findMany({
      where: {
        OR: pairs.map((p) => ({
          userId: p.userId,
          communityId: p.communityId,
        })),
      },
      include: membershipInclude,
    });
  });

  const map = new Map<string, GqlMembership>();
  for (const record of records) {
    const key = `${record.userId}:${record.communityId}`;
    map.set(key, MembershipOutputFormat.get(record));
  }

  return keys.map((k) => map.get(k) ?? null);
}

export function createMembershipLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlMembership | null>((keys) =>
    batchMembershipsByCompositeKey(issuer, keys),
  );
}
