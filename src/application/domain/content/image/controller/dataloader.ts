import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createImageLoader(issuer: PrismaClientIssuer) {
  return createLoaderById<{ id: string; url: string }, string>(
    async (ids) => {
      return issuer.internal((tx) =>
        tx.image.findMany({
          where: { id: { in: [...ids] } },
          select: { id: true, url: true },
        }),
      );
    },
    (record) => record.url,
  );
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

export function createImagesByOpportunityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, string[]>(async (opportunityIds) => {
    const opportunities = await issuer.internal((tx) =>
      tx.opportunity.findMany({
        where: { id: { in: [...opportunityIds] } },
        include: { images: true },
      }),
    );

    const map = new Map<string, string[]>();

    for (const o of opportunities) {
      map.set(
        o.id,
        o.images.map((img) => img.url),
      );
    }

    return opportunityIds.map((id) => map.get(id) ?? []);
  });
}

export function createImagesByUtilityLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, string[]>(async (utilityIds) => {
    const utilities = await issuer.internal((tx) =>
      tx.utility.findMany({
        where: { id: { in: [...utilityIds] } },
        include: { images: true },
      }),
    );

    const map = new Map<string, string[]>();
    for (const u of utilities) {
      map.set(
        u.id,
        u.images.map((img) => img.url),
      );
    }

    return utilityIds.map((id) => map.get(id) ?? []);
  });
}
