import { prismaClient } from "@/prisma/client";
import * as fs from "fs";
import csvParser from "csv-parser";
import { Prisma } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import { faker } from "@faker-js/faker";

function getRandomElement<T>(array: T[]): T {
  return faker.helpers.arrayElement(array);
}

const userIds: string[] = [];
const communityIds: string[] = [];
const cityData: { code: string; stateCode: string; countryCode: string }[] = []; // city.csv のデータを格納

async function main() {
  const args = process.argv.slice(2);
  let all = true;
  if (args.length) {
    all = false;
  }

  // const cityAndState = all || args.includes("--cityAndState");
  const userAndCommunity = all || args.includes("--userAndCommunity");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // if (cityAndState) {
  //   console.log("Starting to seed cities and states...");
  //   await seedCitiesAndStates(
  //     path.join(__dirname, "./city.csv"),
  //     path.join(__dirname, "./state.csv"),
  //   );
  //   console.log("Cities and states have been seeded!");
  // }

  if (userAndCommunity) {
    console.log("Starting to seed users and communities...");
    await seedUsersAndCommunities(path.join(__dirname, "./city.csv"));
    console.log("Users and communities have been seeded!");
  }
}

// async function seedCitiesAndStates(citiesCsvPath: string, statesCsvPath: string) {
//   console.log("Seeding State...");
//   const stateQueries: Prisma.PrismaPromise<unknown>[] = [];
//   fs.createReadStream(statesCsvPath)
//     .pipe(csvParser())
//     .on("data", (row) => {
//       const code: string = row.code;
//       const countryCode: string = row.country_code;
//       const name: string = row.name;
//       stateQueries.push(
//         prismaClient.state.upsert({
//           where: { code_countryCode: { code, countryCode } },
//           update: { countryCode, name },
//           create: { code, countryCode, name },
//         }),
//       );
//     })
//     .on("end", async () => {
//       await prismaClient.$transaction(stateQueries);
//       console.log("State has been seeded!");
//
//       console.log("Seeding City...");
//       const cityQueries: Prisma.PrismaPromise<unknown>[] = [];
//       fs.createReadStream(citiesCsvPath)
//         .pipe(csvParser())
//         .on("data", (row) => {
//           const code: string = row.code;
//           const stateCode: string = row.state_code;
//           const countryCode: string = row.country_code;
//           const name: string = row.name;
//           cityQueries.push(
//             prismaClient.city.upsert({
//               where: { code },
//               update: { stateCode, countryCode, name },
//               create: { code, stateCode, countryCode, name },
//             }),
//           );
//         })
//         .on("end", async () => {
//           await prismaClient.$transaction(cityQueries);
//           console.log("City has been seeded!");
//         });
//     });
// }

async function seedUsersAndCommunities(citiesCsvPath: string) {
  console.log("Loading City Data...");
  await new Promise<void>((resolve) => {
    fs.createReadStream(citiesCsvPath)
      .pipe(csvParser())
      .on("data", (row) => {
        const code: string = row.code;
        const stateCode: string = row.state_code;
        const countryCode: string = row.country_code;
        cityData.push({ code, stateCode, countryCode }); // cityData に保存
      })
      .on("end", () => {
        console.log("City data loaded!");
        resolve();
      });
  });

  console.log("Seeding Users...");

  const userPromises: Prisma.PrismaPromise<unknown>[] = [];
  for (let i = 0; i < 50; i++) {
    const userId = faker.string.uuid();
    userIds.push(userId);

    const data: Prisma.UserCreateInput = {
      id: userId,
      name: faker.person.fullName(),
      slug: faker.animal.dog(),
      image: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
    };

    userPromises.push(
      prismaClient.user.create({
        data,
      }),
    );
  }

  await Promise.all(userPromises);
  console.log("Users seeded!");

  console.log("Seeding Communities...");

  const communityPromises: Prisma.PrismaPromise<unknown>[] = [];
  for (let i = 0; i < 20; i++) {
    const communityId = faker.string.uuid();
    communityIds.push(communityId);

    const randomCity = getRandomElement(cityData); // ランダムに cityData を取得

    const data: Prisma.CommunityCreateInput = {
      id: communityId,
      name: faker.company.name(),
      pointName: faker.animal.cat(),
      image: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
      establishedAt: faker.date.past(),
      website: faker.internet.url(),
      city: { connect: { code: randomCity.code } },
      state: {
        connect: {
          code_countryCode: {
            code: randomCity.stateCode,
            countryCode: randomCity.countryCode,
          },
        },
      },
    };

    communityPromises.push(
      prismaClient.community.create({
        data,
      }),
    );
  }

  await Promise.all(communityPromises);
  console.log("Communities seeded!");

  console.log("Seeding Memberships...");

  const membershipPromises: Prisma.PrismaPromise<unknown>[] = [];
  for (let i = 0; i < 50; i++) {
    const data: Prisma.MembershipCreateInput = {
      user: {
        connect: { id: getRandomElement(userIds) },
      },
      community: {
        connect: { id: getRandomElement(communityIds) },
      },
      status: getRandomElement(["INVITED", "CANCELED", "JOINED", "WITHDRAWED"]),
      role: getRandomElement(["OWNER", "MANAGER", "MEMBER"]),
    };

    membershipPromises.push(
      prismaClient.membership.create({
        data,
      }),
    );
  }

  await Promise.all(membershipPromises);
  console.log("Memberships seeded!");
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
