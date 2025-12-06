import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createImageLoader(prisma: PrismaClient) {
  return createLoaderById<{ id: string; url: string }, string>(
    async (ids) => {
      return prisma.image.findMany({
        where: { id: { in: [...ids] } },
        select: { id: true, url: true },
      });
    },
    (record) => record.url,
  );
}

export function createImagesByParticipationLoader(prisma: PrismaClient) {
  return new DataLoader<string, string[]>(async (participationIds) => {
    const participations = await prisma.participation.findMany({
      where: { id: { in: [...participationIds] } },
      include: { images: true },
    });

    const map = new Map<string, string[]>();

    for (const p of participations) {
      map.set(
        p.id,
        p.images.map((img) => img.url)
      );
    }

    return participationIds.map((id) => map.get(id) ?? []);
  });
}

export function createImagesByOpportunityLoader(prisma: PrismaClient) {
  return new DataLoader<string, string[]>(async (opportunityIds) => {
    const opportunities = await prisma.opportunity.findMany({
      where: { id: { in: [...opportunityIds] } },
      include: { images: true },
    });

    const map = new Map<string, string[]>();

    for (const o of opportunities) {
      map.set(
        o.id,
        o.images.map((img) => img.url)
      );
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}

export function createImagesByUtilityLoader(prisma: PrismaClient) {
  return new DataLoader<string, string[]>(async (utilityIds) => {
    const utilities = await prisma.utility.findMany({
      where: { id: { in: [...utilityIds] } },
      include: { images: true },
    });

    const map = new Map<string, string[]>();
    for (const u of utilities) {
      map.set(
        u.id,
        u.images.map((img) => img.url)
      );
    }

    return utilityIds.map((id) => map.get(id) ?? []);
  });
}
