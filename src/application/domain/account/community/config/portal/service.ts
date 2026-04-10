import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import { CommunityPortalConfig, Prisma } from "@prisma/client";
import { GqlCommunityPortalConfigInput } from "@/types/graphql";
import ICommunityPortalConfigRepository from "@/application/domain/account/community/config/portal/data/interface";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";

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
  ) {}

  async update(
    ctx: IContext,
    communityId: string,
    input: GqlCommunityPortalConfigInput,
    tx: Prisma.TransactionClient,
  ): Promise<CommunityPortalConfig> {
    const data: Prisma.CommunityPortalConfigCreateWithoutConfigInput = {
      ...(input.tokenName      !== undefined && input.tokenName      !== null && { tokenName: input.tokenName }),
      ...(input.title          !== undefined && input.title          !== null && { title: input.title }),
      ...(input.description    !== undefined && input.description    !== null && { description: input.description }),
      ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
      ...(input.domain         !== undefined && input.domain         !== null && { domain: input.domain }),
      ...(input.faviconPrefix  !== undefined && input.faviconPrefix  !== null && { faviconPrefix: input.faviconPrefix }),
      ...(input.logoPath       !== undefined && input.logoPath       !== null && { logoPath: input.logoPath }),
      ...(input.squareLogoPath !== undefined && input.squareLogoPath !== null && { squareLogoPath: input.squareLogoPath }),
      ...(input.ogImagePath    !== undefined && input.ogImagePath    !== null && { ogImagePath: input.ogImagePath }),
      ...(input.enableFeatures !== undefined && input.enableFeatures !== null && { enableFeatures: input.enableFeatures }),
      ...(input.rootPath       !== undefined && input.rootPath       !== null && { rootPath: input.rootPath }),
      ...(input.adminRootPath  !== undefined && input.adminRootPath  !== null && { adminRootPath: input.adminRootPath }),
      ...(input.regionName     !== undefined && { regionName: input.regionName }),
      ...(input.regionKey      !== undefined && { regionKey: input.regionKey }),
    };
    return this.portalRepository.upsert(ctx, communityId, data, tx);
  }

  async getPortalConfig(ctx: IContext, communityId: string): Promise<CommunityPortalConfigResult> {
    const portalConfig = await this.portalRepository.getPortalConfig(ctx, communityId);
    if (!portalConfig) {
      throw new NotFoundError("Portal config not found", { communityId });
    }

    const [lineConfig, firebaseConfig] = await Promise.all([
      this.configRepository.getLineConfig(ctx, communityId),
      this.configRepository.getFirebaseConfig(ctx.issuer, communityId),
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
}
