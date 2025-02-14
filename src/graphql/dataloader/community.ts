import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/prisma/client";
import { GqlCommunity } from "@/types/graphql";
import CommunityOutputFormat from "@/domains/community/presenter/output";
import { communityInclude } from "@/domains/community/type";

async function batchCommunitiesById(
  issuer: PrismaClientIssuer,
  communityIds: readonly string[],
): Promise<(GqlCommunity | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.community.findMany({
      where: { id: { in: [...communityIds] } },
      include: communityInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, CommunityOutputFormat.get(record)]));

  return communityIds.map((id) => map.get(id) ?? null);
}

export function createCommunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlCommunity | null>((keys) => batchCommunitiesById(issuer, keys));
}
