import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlPlace } from "@/types/graphql";
import PlaceOutputFormat from "@/presentation/graphql/dto/place/output";
import { placeInclude } from "@/infrastructure/prisma/types/place";

async function batchPlacesById(
  issuer: PrismaClientIssuer,
  placeIds: readonly string[],
): Promise<(GqlPlace | null)[]> {
  const records = await issuer.internal(async (tx) => {
    return tx.place.findMany({
      where: { id: { in: [...placeIds] } },
      include: placeInclude,
    });
  });

  const map = new Map(records.map((record) => [record.id, PlaceOutputFormat.get(record)]));

  return placeIds.map((id) => map.get(id) ?? null);
}

export function createPlaceLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlPlace | null>((keys) => batchPlacesById(issuer, keys));
}
