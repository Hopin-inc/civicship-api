import { Prisma } from "@prisma/client";

export const userAuthInclude = Prisma.validator<Prisma.UserInclude>()({
  identities: true,
  memberships: true,
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
  preferredLanguage: true,

  imageId: true,

  // §9.7 GDPR: deletedAt / deletedReason は schema 追加に伴い select に含める。
  // identity/service.ts が `Promise<User>` を返すため、PrismaUserDetail と Prisma.User の構造的整合が必要。
  deletedAt: true,
  deletedReason: true,

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
