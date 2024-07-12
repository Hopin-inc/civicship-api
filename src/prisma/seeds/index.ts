import { prismaClient } from "@/prisma/client";
import * as fs from "fs";
import csvParser from "csv-parser";
import { Prisma } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";

async function main() {
  const args = process.argv.slice(2);
  let all = true;
  if (args.length) {
    all = false;
  }

  const agenda = all || args.includes("--agenda");
  const cityAndState = all || args.includes("--cityAndState");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const promise: Promise<any>[] = [];
  if (agenda) {
    promise.push(seedAgendas(path.join(__dirname, "./agenda.csv")));
  }
  if (cityAndState) {
    promise.push(seedCitiesAndStates(
      path.join(__dirname, "./city.csv"),
      path.join(__dirname, "./state.csv")
    ));
  }
  await Promise.all(promise);
}

async function seedAgendas(csvPath: string) {
  console.log("Seeding Agenda...");
  const agendaQueries: Prisma.PrismaPromise<any>[] = [];
  fs.createReadStream(csvPath)
    .pipe(csvParser())
    .on("data", row => {
      const id = parseInt(row.id);
      const code: string = row.code;
      const name: string = row.name;
      agendaQueries.push(prismaClient.agenda.upsert({
        where: { id },
        update: { code, name },
        create: { id, code, name }
      }));
    })
    .on("end", async () => {
      await prismaClient.$transaction(agendaQueries);
      console.log("Agenda has been seeded!");
    });
}

async function seedCitiesAndStates(citiesCsvPath: string, statesCsvPath: string) {
  console.log("Seeding State...");
  const stateQueries: Prisma.PrismaPromise<any>[] = [];
  fs.createReadStream(statesCsvPath)
    .pipe(csvParser())
    .on("data", row => {
      const code: string = row.code;
      const countryCode: string = row.country_code;
      const name: string = row.name;
      stateQueries.push(prismaClient.state.upsert({
        where: { code_countryCode: { code, countryCode } },
        update: { countryCode, name },
        create: { code, countryCode, name }
      }));
    })
    .on("end", async () => {
      await prismaClient.$transaction(stateQueries);
      console.log("State has been seeded!");

      console.log("Seeding City...");
      const cityQueries: Prisma.PrismaPromise<any>[] = [];
      fs.createReadStream(citiesCsvPath)
        .pipe(csvParser())
        .on("data", row => {
          const code: string = row.code;
          const stateCode: string = row.state_code;
          const countryCode: string = row.country_code;
          const name: string = row.name;
          cityQueries.push(prismaClient.city.upsert({
            where: { code },
            update: { stateCode, countryCode, name },
            create: { code, stateCode, countryCode, name }
          }));
        })
        .on("end", async () => {
          await prismaClient.$transaction(cityQueries);
          console.log("City has been seeded!");
        });
    });
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
