import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { GqlUtility } from "@/types/graphql";
import UtilityOutputFormat from "@/presen/graphql/dto/utility/output";
import { utilityInclude } from "@/infra/prisma/types/utility";

async function batchUtilitiesById(
  issuer: PrismaClientIssuer,
  utilityIds: readonly string[],
): Promise<(GqlUtility | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.utility.findMany({
      where: { id: { in: [...utilityIds] } },
      include: utilityInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, UtilityOutputFormat.get(record)]));

  return utilityIds.map((id) => map.get(id) ?? null);
}

export function createUtilityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUtility | null>((keys) => batchUtilitiesById(issuer, keys));
}
