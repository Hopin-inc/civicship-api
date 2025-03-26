import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { processInBatches } from "@/infrastructure/prisma/seeds/domains/utilis";

export async function seedUtilities(
  tx: Prisma.TransactionClient, // TransactionClient を受け取る
  communityIds: string[],
): Promise<Record<string, string[]>> {
  console.log("Seeding Utilities...");

  if (communityIds.length === 0) {
    throw new Error("Community IDs cannot be empty.");
  }

  const communityUtilityMap: Record<string, string[]> = {};

  const utilityTasks = Array.from({ length: 10 }, () => {
    const communityId = faker.helpers.arrayElement(communityIds);

    if (!communityId) {
      throw new Error("No valid community ID for utility creation.");
    }

    const utilityId = faker.string.uuid();

    if (!communityUtilityMap[communityId]) {
      communityUtilityMap[communityId] = [];
    }
    communityUtilityMap[communityId].push(utilityId);

    return {
      id: utilityId,
      name: faker.commerce.productName(),
      description: faker.lorem.paragraph(),
      image: faker.image.avatar(),
      pointsRequired: faker.number.int({ min: 10, max: 500 }),
      community: { connect: { id: communityId } },
    };
  });

  // トランザクションクライアントでバッチ処理
  await processInBatches(utilityTasks, 3, async (batch) => {
    await Promise.all(
      batch.map(async (data) => {
        await tx.utility.create({ data });
      }),
    );
  });

  console.log("Utilities seeded!");
  return communityUtilityMap;
}
