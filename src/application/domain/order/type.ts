import { Prisma } from "@prisma/client";

export const orderSelectBase = Prisma.validator<Prisma.OrderSelect>()({
  id: true,
  status: true,
  paymentProvider: true,
  externalRef: true,
  totalAmount: true,

  userId: true,
  user: true,

  items: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaOrder = Prisma.OrderGetPayload<{ select: typeof orderSelectBase }>;
