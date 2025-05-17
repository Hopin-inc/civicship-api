import { Prisma } from "@prisma/client";

export const identitySelectDetail = Prisma.validator<Prisma.IdentitySelect>()({
  uid: true,
  platform: true,

  userId: true,

  authToken: true,
  refreshToken: true,
  tokenExpiresAt: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaIdentityDetail = Prisma.IdentityGetPayload<{
  select: typeof identitySelectDetail;
}>;
