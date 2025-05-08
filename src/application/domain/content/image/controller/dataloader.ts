import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

async function batchImagesById(
  issuer: PrismaClientIssuer,
  imageIds: readonly string[],
): Promise<(string | null)[]> {
  const records = await issuer.internal(async (tx) =>
    tx.image.findMany({
      where: { id: { in: [...imageIds] } },
      select: { id: true, url: true },
    }),
  );
  const map = new Map(records.map((record) => [record.id, record.url]));
  return imageIds.map((id) => map.get(id) ?? null);
}

export function createImageLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, string | null>((keys) => batchImagesById(issuer, keys));
}
