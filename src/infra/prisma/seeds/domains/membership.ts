import { faker } from "@faker-js/faker";
import { MembershipStatus, Role, WalletType, Prisma } from "@prisma/client";
import { processInBatches } from "@/infra/prisma/seeds/domains/utilis";

export async function seedMemberships(
  tx: Prisma.TransactionClient, // TransactionClient を受け取る
  userIds: string[],
  communityIds: string[],
  communityUserMap: Record<string, string[]>,
): Promise<Record<string, string[]>> {
  console.log("Seeding Memberships and Wallets...");
  const walletIds: Record<string, string[]> = {};

  if (userIds.length === 0 || communityIds.length === 0) {
    throw new Error("User IDs or Community IDs cannot be empty.");
  }

  const membershipTasks = Array.from({ length: 10 }, () => {
    let userId: string;
    let communityId: string;

    do {
      userId = faker.helpers.arrayElement(userIds);
      communityId = faker.helpers.arrayElement(communityIds);
    } while (communityUserMap[communityId]?.includes(userId));

    if (!walletIds[communityId]) {
      walletIds[communityId] = [];
    }

    const walletId = faker.string.uuid();
    walletIds[communityId].push(walletId);
    communityUserMap[communityId].push(userId);

    return {
      membership: {
        user: { connect: { id: userId } },
        community: { connect: { id: communityId } },
        status: faker.helpers.arrayElement(Object.values(MembershipStatus)),
        role: faker.helpers.arrayElement(Object.values(Role)),
      },
      wallet: {
        id: walletId,
        type: WalletType.MEMBER,
        user: { connect: { id: userId } },
        community: { connect: { id: communityId } },
      },
    };
  });

  // トランザクションクライアントでバッチ処理
  await processInBatches(membershipTasks, 3, async (batch) => {
    await Promise.all(
      batch.map(async ({ membership, wallet }) => {
        await tx.membership.create({ data: membership });
        await tx.wallet.create({ data: wallet });
      }),
    );
  });

  console.log("Memberships and Wallets seeded!");
  return walletIds;
}
