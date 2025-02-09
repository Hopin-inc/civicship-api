import * as fs from "fs";
import csvParser from "csv-parser";
import { faker } from "@faker-js/faker";
import { WalletType, Prisma } from "@prisma/client";
import { processInBatches } from "@/prisma/seeds/domains/utilis";

export async function seedCommunities(
  tx: Prisma.TransactionClient, // トランザクションクライアントを受け取る
  citiesCsvPath: string,
): Promise<{
  communityIds: string[];
  cityData: { code: string; stateCode: string; countryCode: string }[];
  communityUserMap: Record<string, string[]>;
  communityWalletIds: Record<string, string>;
}> {
  console.log("Loading City Data...");
  const cityData: { code: string; stateCode: string; countryCode: string }[] = [];
  const communityUserMap: Record<string, string[]> = {};
  const communityIds: string[] = [];
  const communityWalletIds: Record<string, string> = {};

  // CSVデータの読み込み
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(citiesCsvPath)
      .pipe(csvParser())
      .on("data", (row) => {
        cityData.push({
          code: row.code,
          stateCode: row.state_code,
          countryCode: row.country_code,
        });
      })
      .on("end", resolve)
      .on("error", reject);
  });

  if (cityData.length === 0) {
    throw new Error("No city data loaded. Ensure the city CSV file is correct.");
  }

  console.log("Seeding Communities...");

  // コミュニティデータの準備
  const communityTasks = Array.from({ length: 5 }, () => {
    const communityId = faker.string.uuid();
    const walletId = faker.string.uuid();
    const randomCity = faker.helpers.arrayElement(cityData);

    if (!randomCity) {
      throw new Error("No valid city available for community creation.");
    }

    communityIds.push(communityId);
    communityUserMap[communityId] = [];
    communityWalletIds[communityId] = walletId;

    return {
      community: {
        id: communityId,
        name: faker.company.name(),
        pointName: faker.animal.cat(),
        image: faker.image.avatar(),
        bio: faker.lorem.paragraph(),
        establishedAt: faker.date.past(),
        website: faker.internet.url(),
        city: { connect: { code: randomCity.code } },
      },
      wallet: {
        id: walletId,
        type: WalletType.COMMUNITY,
        community: { connect: { id: communityId } },
      },
    };
  });

  // コミュニティとウォレットをトランザクションで作成
  await processInBatches(communityTasks, 3, async (batch) => {
    for (const { community, wallet } of batch) {
      await tx.community.create({ data: community });
      await tx.wallet.create({ data: wallet });
    }
  });

  console.log("Communities and Wallets seeded!");
  return { communityIds, cityData, communityUserMap, communityWalletIds };
}
