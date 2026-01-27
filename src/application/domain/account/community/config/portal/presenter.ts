import {
  GqlCommunityPortalConfig,
  GqlCommunityPortalConfigUpsertPayload,
} from "@/types/graphql";
import { PrismaCommunityPortalConfigDetail } from "@/application/domain/account/community/config/portal/data/type";
import { featureStringsToEnums } from "@/application/domain/account/community/config/portal/data/util";
import {
  CommunityDocument,
  CommonDocumentOverrides,
} from "@/application/domain/account/community/config/portal/service";

interface ExtraFields {
  communityId: string;
}

export default class CommunityPortalConfigPresenter {
  static get(r: PrismaCommunityPortalConfigDetail, extra: ExtraFields): GqlCommunityPortalConfig {
    return {
      __typename: "CommunityPortalConfig",
      communityId: extra.communityId,
      tokenName: r.tokenName,
      title: r.title,
      description: r.description,
      shortDescription: r.shortDescription,
      domain: r.domain,
      faviconPrefix: r.faviconPrefix,
      logoPath: r.logoPath,
      squareLogoPath: r.squareLogoPath,
      ogImagePath: r.ogImagePath,
      enableFeatures: r.enableFeatures as string[],
      features: featureStringsToEnums(r.enableFeatures as string[]),
      rootPath: r.rootPath,
      adminRootPath: r.adminRootPath,
      documents: r.documents as CommunityDocument[] | null,
      commonDocumentOverrides: r.commonDocumentOverrides as CommonDocumentOverrides | null,
      regionName: r.regionName,
      regionKey: r.regionKey,
      liffId: null,
      liffAppId: null,
      liffBaseUrl: null,
      firebaseTenantId: null,
    };
  }

  static upsert(
    r: PrismaCommunityPortalConfigDetail,
    extra: ExtraFields,
  ): GqlCommunityPortalConfigUpsertPayload {
    return {
      __typename: "CommunityPortalConfigUpsertSuccess",
      portalConfig: this.get(r, extra),
    };
  }
}
