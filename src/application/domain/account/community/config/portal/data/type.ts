import { Prisma } from "@prisma/client";

export const communityPortalConfigSelect = Prisma.validator<Prisma.CommunityPortalConfigSelect>()({
  id: true,
  configId: true,
  tokenName: true,
  title: true,
  description: true,
  shortDescription: true,
  domain: true,
  faviconPrefix: true,
  logoPath: true,
  squareLogoPath: true,
  ogImagePath: true,
  enableFeatures: true,
  rootPath: true,
  adminRootPath: true,
  documents: true,
  commonDocumentOverrides: true,
  regionName: true,
  regionKey: true,
  createdAt: true,
  updatedAt: true,
});

export type PrismaCommunityPortalConfigDetail = Prisma.CommunityPortalConfigGetPayload<{
  select: typeof communityPortalConfigSelect;
}>;
