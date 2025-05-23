import path from "path";
import { fileURLToPath } from "url";
import { seedMaster } from "@/infrastructure/prisma/seeds/master";
import { seedUsecase } from "@/infrastructure/prisma/seeds/domains";

async function main() {
  const args = process.argv.slice(2);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  if (args.includes("--master")) {
    console.info("Starting to seed cities and states...");
    await seedMaster(path.join(__dirname, "./city.csv"), path.join(__dirname, "./state.csv"));
    console.info("Cities and states have been seeded!");
  }

  if (args.includes("--domain")) {
    console.info("Starting to seed users and communities...");
    await seedUsecase();
    console.info("Users and communities have been seeded!");
  }
}

main()
  .then(() => {
    console.info("Seeding completed successfully!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
