import { prismaClient } from "@/infrastructure/prisma/client";
import * as fs from "fs";
import csvParser from "csv-parser";
import { Prisma } from "@prisma/client";

export async function seedMaster(citiesCsvPath: string, statesCsvPath: string) {
  console.log("Seeding State...");
  const stateQueries: Prisma.PrismaPromise<unknown>[] = [];
  fs.createReadStream(statesCsvPath)
    .pipe(csvParser())
    .on("data", (row) => {
      const code: string = row.code;
      const countryCode: string = row.country_code;
      const name: string = row.name;
      stateQueries.push(
        prismaClient.state.upsert({
          where: { code_countryCode: { code, countryCode } },
          update: { countryCode, name },
          create: { code, countryCode, name },
        }),
      );
    })
    .on("end", async () => {
      await prismaClient.$transaction(stateQueries);
      console.log("State has been seeded!");

      console.log("Seeding City...");
      const cityQueries: Prisma.PrismaPromise<unknown>[] = [];
      fs.createReadStream(citiesCsvPath)
        .pipe(csvParser())
        .on("data", (row) => {
          const code: string = row.code;
          const stateCode: string = row.state_code;
          const countryCode: string = row.country_code;
          const name: string = row.name;
          cityQueries.push(
            prismaClient.city.upsert({
              where: { code },
              update: { stateCode, countryCode, name },
              create: { code, stateCode, countryCode, name },
            }),
          );
        })
        .on("end", async () => {
          await prismaClient.$transaction(cityQueries);
          console.log("City has been seeded!");
        });
    });
}
