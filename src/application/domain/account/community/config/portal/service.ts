import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import ICommunityPortalConfigRepository from "@/application/domain/account/community/config/portal/data/interface";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import CommunityPortalConfigConverter from "@/application/domain/account/community/config/portal/data/converter";
import { GqlCommunityPortalConfigUpsertInput } from "@/types/graphql";
import { PrismaCommunityPortalConfigDetail } from "@/application/domain/account/community/config/portal/data/type";

export interface CommunityPortalConfigResult {
  communityId: string;
  tokenName: string;
  title: string;
  description: string;
  shortDescription: string | null;
  domain: string;
  faviconPrefix: string;
  logoPath: string;
  squareLogoPath: string;
  ogImagePath: string;
  enableFeatures: string[];
  rootPath: string;
  adminRootPath: string;
  documents: CommunityDocument[] | null;
  commonDocumentOverrides: CommonDocumentOverrides | null;
  regionName: string | null;
  regionKey: string | null;
  liffId: string | null;
  liffAppId: string | null;
  liffBaseUrl: string | null;
  firebaseTenantId: string | null;
}

export interface CommunityDocument {
  id: string;
  title: string;
  path: string;
  type: string;
  order?: number;
}

export interface CommonDocumentOverrides {
  terms?: CommunityDocument;
  privacy?: CommunityDocument;
}

@injectable()
export default class CommunityPortalConfigService {
  constructor(
    @inject("CommunityPortalConfigRepository")
    private readonly portalRepository: ICommunityPortalConfigRepository,
    @inject("CommunityConfigRepository")
    private readonly configRepository: ICommunityConfigRepository,
    @inject("CommunityPortalConfigConverter")
    private readonly converter: CommunityPortalConfigConverter,
  ) {}

  async getPortalConfig(ctx: IContext, communityId: string): Promise<CommunityPortalConfigResult> {
    const portalConfig = await this.portalRepository.getPortalConfig(ctx, communityId);
    if (!portalConfig) {
      throw new NotFoundError("Portal config not found", { communityId });
    }

    const [lineConfig, firebaseConfig] = await Promise.all([
      this.configRepository.getLineConfig(ctx, communityId),
      this.configRepository.getFirebaseConfig(ctx, communityId),
    ]);

    return {
      communityId,
      tokenName: portalConfig.tokenName,
      title: portalConfig.title,
      description: portalConfig.description,
      shortDescription: portalConfig.shortDescription,
      domain: portalConfig.domain,
      faviconPrefix: portalConfig.faviconPrefix,
      logoPath: portalConfig.logoPath,
      squareLogoPath: portalConfig.squareLogoPath,
      ogImagePath: portalConfig.ogImagePath,
      enableFeatures: portalConfig.enableFeatures as string[],
      rootPath: portalConfig.rootPath,
      adminRootPath: portalConfig.adminRootPath,
      documents: portalConfig.documents as CommunityDocument[] | null,
      commonDocumentOverrides: portalConfig.commonDocumentOverrides as CommonDocumentOverrides | null,
      regionName: portalConfig.regionName,
      regionKey: portalConfig.regionKey,
      liffId: lineConfig?.liffId ?? null,
      liffAppId: lineConfig?.liffAppId ?? null,
      liffBaseUrl: lineConfig?.liffBaseUrl ?? null,
      firebaseTenantId: firebaseConfig?.tenantId ?? null,
    };
  }

  async upsertPortalConfig(
    ctx: IContext,
    input: GqlCommunityPortalConfigUpsertInput,
    communityId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaCommunityPortalConfigDetail> {
    const config = await tx.communityConfig.findUnique({
      where: { communityId },
    });
    if (!config) {
      throw new NotFoundError("CommunityConfig not found", { communityId });
    }

    const args = this.converter.upsert(input, config.id);
    return this.portalRepository.upsert(ctx, args, tx);
  }
}
