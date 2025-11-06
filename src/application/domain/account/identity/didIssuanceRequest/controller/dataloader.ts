import { PrismaClient } from "@prisma/client";
import { createHasManyLoaderByKey } from "@/presentation/graphql/dataloader/utils";
import { Prisma } from "@prisma/client";
import { GqlDidIssuanceRequest } from "@/types/graphql";

const select = Prisma.validator<Prisma.DidIssuanceRequestSelect>()({
  id: true,
  status: true,
  didValue: true,
  requestedAt: true,
  processedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export function createDidIssuanceRequestsByUserIdLoader(prisma: PrismaClient) {
  return createHasManyLoaderByKey(
    "userId",
    async (userIds) =>
      prisma.didIssuanceRequest.findMany({
        where: { userId: { in: [...userIds] } },
        select,
      }),
    (record): GqlDidIssuanceRequest => ({
      __typename: "DidIssuanceRequest",
      id: record.id,
      status: record.status,
      didValue: record.didValue ?? null,
      requestedAt: record.requestedAt,
      processedAt: record.processedAt ?? null,
      completedAt: record.completedAt ?? null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? null,
    })
  );
}
