import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlCity, GqlState } from "@/types/graphql";
import MasterPresenter from "@/application/domain/location/master/presenter";
import { citySelectDetail } from "@/application/domain/location/master/data/type";

async function batchCitiesByCode(
  issuer: PrismaClientIssuer,
  cityCodes: readonly string[],
): Promise<(GqlCity | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.city.findMany({
      where: { code: { in: [...cityCodes] } },
      select: citySelectDetail,
    });
  });

  const map = new Map(records.map((record) => [record.code, MasterPresenter.get(record)]));

  return cityCodes.map((code) => map.get(code) ?? null) as (GqlCity | null)[];
}

async function batchStatesByCode(
  issuer: PrismaClientIssuer,
  stateCodes: readonly string[],
): Promise<(GqlState | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.state.findMany({
      where: { code: { in: [...stateCodes] } },
      select: {
        code: true,
        name: true,
        countryCode: true,
      },
    });
  });

  const map = new Map(
    records.map((record) => [
      record.code,
      {
        code: record.code,
        name: record.name,
        countryCode: record.countryCode,
      },
    ]),
  );

  return stateCodes.map((code) => map.get(code) ?? null) as (GqlState | null)[];
}

export function createCityByCodeLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlCity | null>((keys) => batchCitiesByCode(issuer, keys));
}

export function createStateByCodeLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlState | null>((keys) => batchStatesByCode(issuer, keys));
}
