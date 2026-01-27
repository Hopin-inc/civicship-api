import { GqlCommunityPortalConfigUpsertInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { featureEnumsToStrings } from "@/application/domain/account/community/config/portal/data/util";
import {
  CommunityDocument,
  CommonDocumentOverrides,
} from "@/application/domain/account/community/config/portal/service";

export interface PortalConfigUploadedPaths {
  faviconPath?: string | null;
  logoPath?: string | null;
  squareLogoPath?: string | null;
  ogImagePath?: string | null;
  documents?: CommunityDocument[] | null;
  commonDocumentOverrides?: CommonDocumentOverrides | null;
}

@injectable()
export default class CommunityPortalConfigConverter {
  upsert(
    input: GqlCommunityPortalConfigUpsertInput,
    configId: string,
    uploadedPaths: PortalConfigUploadedPaths,
  ): Prisma.CommunityPortalConfigUpsertArgs {
    const data = {
      tokenName: input.tokenName,
      title: input.title,
      description: input.description,
      shortDescription: input.shortDescription ?? null,
      domain: input.domain,
      faviconPrefix: uploadedPaths.faviconPath ?? "",
      logoPath: uploadedPaths.logoPath ?? "",
      squareLogoPath: uploadedPaths.squareLogoPath ?? "",
      ogImagePath: uploadedPaths.ogImagePath ?? "",
      enableFeatures: featureEnumsToStrings(input.features),
      rootPath: input.rootPath ?? "/",
      adminRootPath: input.adminRootPath ?? "/admin",
      documents: uploadedPaths.documents ?? Prisma.JsonNull,
      commonDocumentOverrides: uploadedPaths.commonDocumentOverrides ?? Prisma.JsonNull,
      regionName: input.regionName ?? null,
      regionKey: input.regionKey ?? null,
    };

    return {
      where: { configId },
      create: {
        ...data,
        config: { connect: { id: configId } },
      },
      update: data,
    };
  }
}
