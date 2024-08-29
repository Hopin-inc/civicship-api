import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
});

export interface Context {
  prisma: PrismaClient;
}

export const createContext: () => Context = () => {
  return { prisma: prismaClient };
};
