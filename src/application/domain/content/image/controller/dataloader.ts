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

export function createImagesByParticipationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, string[]>(async (participationIds) => {
    const participations = await issuer.internal((tx) =>
      tx.participation.findMany({
        where: { id: { in: [...participationIds] } },
        include: { images: true },
      }),
    );

    const map = new Map<string, string[]>();

    for (const p of participations) {
      map.set(
        p.id,
        p.images.map((img) => img.url),
      );
    }

    return participationIds.map((id) => map.get(id) ?? []);
  });
}
