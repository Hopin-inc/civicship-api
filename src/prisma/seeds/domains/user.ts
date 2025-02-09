import { faker } from "@faker-js/faker";
import { processInBatches } from "@/prisma/seeds/domains/utilis";
import { Prisma } from "@prisma/client";

export async function seedUsers(tx: Prisma.TransactionClient): Promise<string[]> {
  console.log("Seeding Users...");
  const userIds: string[] = [];

  const userTasks = Array.from({ length: 3 }, () => {
    const userId = faker.string.uuid();
    userIds.push(userId);
    return {
      id: userId,
      name: faker.person.fullName(),
      slug: faker.animal.dog(),
      image: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
    };
  });

  await processInBatches(userTasks, 3, async (batch) => {
    await Promise.all(batch.map((data) => tx.user.create({ data })));
  });

  console.log("Users seeded!");
  return userIds;
}
