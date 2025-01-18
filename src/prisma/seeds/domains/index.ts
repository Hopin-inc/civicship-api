import { seedUsers } from "@/prisma/seeds/domains/user";
import { seedCommunities } from "@/prisma/seeds/domains/community";
import { seedMemberships } from "@/prisma/seeds/domains/membership";
import { seedOpportunities } from "@/prisma/seeds/domains/opportunity";
import { seedUtilities } from "@/prisma/seeds/domains/utility";
import { seedTransactions } from "@/prisma/seeds/domains/transaction";
import { prismaClient } from "@/prisma/client";

export async function seedUsecase(citiesCsvPath: string) {
  console.log("Starting database seeding...");

  await prismaClient.$transaction(async (tx) => {
    const userIds = await seedUsers(tx);
    const { communityIds, cityData, communityUserMap, communityWalletIds } = await seedCommunities(
      tx,
      citiesCsvPath,
    );

    const memberWalletIds = await seedMemberships(tx, userIds, communityIds, communityUserMap);
    const approvedParticipationIds = await seedOpportunities(
      tx,
      communityIds,
      userIds,
      cityData,
      communityUserMap,
    );
    const utilityMap = await seedUtilities(tx, communityIds);

    await seedTransactions(
      tx,
      communityIds,
      communityWalletIds,
      memberWalletIds,
      utilityMap,
      approvedParticipationIds,
    );
  });

  console.log("Seeding completed successfully!");
}
