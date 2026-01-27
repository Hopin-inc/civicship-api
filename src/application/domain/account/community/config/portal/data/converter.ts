import { GqlCommunityPortalConfigUpsertInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";
import { featureEnumsToStrings } from "@/application/domain/account/community/config/portal/data/util";

@injectable()
export default class CommunityPortalConfigConverter {
  upsert(
    input: GqlCommunityPortalConfigUpsertInput,
    configId: string,
  ): Prisma.CommunityPortalConfigUpsertArgs {
    const data = {
      tokenName: input.tokenName,
      title: input.title,
      description: input.description,
      shortDescription: input.shortDescription ?? null,
      domain: input.domain,
      faviconPrefix: input.faviconPrefix,
      logoPath: input.logoPath,
      squareLogoPath: input.squareLogoPath,
      ogImagePath: input.ogImagePath,
      enableFeatures: featureEnumsToStrings(input.features),
      rootPath: input.rootPath ?? "/",
      adminRootPath: input.adminRootPath ?? "/admin",
      documents: input.documents ?? Prisma.JsonNull,
      commonDocumentOverrides: input.commonDocumentOverrides ?? Prisma.JsonNull,
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
