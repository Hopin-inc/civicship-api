import { Prisma } from "@prisma/client";

export const userAuthInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
  memberships: true,
  opportunitiesCreatedByMe: true,
});

export const userInclude = Prisma.validator<Prisma.UserInclude>()({
  image: true,
  identities: true,
});

export const userSelectDetail = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  slug: true,
  bio: true,
  sysRole: true,
  currentPrefecture: true,
  urlWebsite: true,
  urlX: true,
  urlFacebook: true,
  urlInstagram: true,
  urlYoutube: true,
  urlTiktok: true,
  phoneNumber: true,

  imageId: true,

  createdAt: true,
  updatedAt: true,
});

export type PrismaAuthUser = Prisma.UserGetPayload<{
  include: typeof userAuthInclude;
}>;

export type PrismaUser = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

export type PrismaUserDetail = Prisma.UserGetPayload<{
  select: typeof userSelectDetail;
}>;
