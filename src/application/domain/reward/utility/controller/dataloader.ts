import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlUtility } from "@/types/graphql";
import UtilityPresenter from "@/application/domain/reward/utility/presenter";
import { utilitySelectDetail } from "@/application/domain/reward/utility/data/type";

async function batchUtilitiesById(
  issuer: PrismaClientIssuer,
  utilityIds: readonly string[],
): Promise<(GqlUtility | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.utility.findMany({
      where: { id: { in: [...utilityIds] } },
      select: utilitySelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.id, UtilityPresenter.get(record)])) as Map<string, GqlUtility | null>;

  return utilityIds.map((id) => map.get(id) ?? null);
}

export function createUtilityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUtility | null>((keys) => batchUtilitiesById(issuer, keys));
}
