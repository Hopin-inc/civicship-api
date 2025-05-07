import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

async function batchImagesById(
  issuer: PrismaClientIssuer,
  imageIds: readonly string[],
): Promise<(GqlImage | null)[]> {
  const records = await issuer.internal(async (tx) =>
    tx.image.findMany({
      where: { id: { in: [...imageIds] } },
      select: imageSelectDetail,
    }),
  );
  const map = new Map(records.map((record) => [record.id, ImagePresenter.get(record)]));
  return imageIds.map((id) => map.get(id) ?? null);
}

export function createImageLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlImage | null>((keys) => batchImagesById(issuer, keys));
}
