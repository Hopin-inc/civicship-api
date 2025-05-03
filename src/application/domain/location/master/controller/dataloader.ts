import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlCity } from "@/types/graphql";
import MasterPresenter from "@/application/domain/location/master/presenter";
import { citySelectDetail } from "@/application/domain/location/master/data/type";

async function batchCitiesById(
  issuer: PrismaClientIssuer,
  cityIds: readonly string[],
): Promise<(GqlCity | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.city.findMany({
      where: { id: { in: [...cityIds] } },
      select: citySelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.id, MasterPresenter.get(record)]));

  return cityIds.map((id) => map.get(id) ?? null);
}

export function createCityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlCity | null>((keys) => batchCitiesById(issuer, keys));
}
