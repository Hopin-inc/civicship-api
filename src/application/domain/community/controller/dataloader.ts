import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlCommunity } from "@/types/graphql";
import CommunityOutputFormat from "@/application/domain/community/presenter";
import { communityInclude } from "@/application/domain/community/data/type";

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
