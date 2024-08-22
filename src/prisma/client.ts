import { PrismaClient } from "@prisma/client";
import { eventExtensionConfig } from "@/prisma/extension/event.extension";

export const prismaClient = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
  ],
}).$extends(eventExtensionConfig);
