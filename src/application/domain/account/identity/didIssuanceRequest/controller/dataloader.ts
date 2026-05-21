import { DidMethod, PrismaClient } from "@prisma/client";
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
        // IDENTUS 時代の did:prism 行は履歴として DB に残すが、API では
        // 自前発行の did:web (INTERNAL) のみを返す。レガシー DID を
        // クライアントに露出させない担保はフロント任せにせずここで行う。
        where: { userId: { in: [...userIds] }, didMethod: DidMethod.INTERNAL },
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
    }),
  );
}
