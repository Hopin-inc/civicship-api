import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import { GqlCommunityPortalConfigInput } from "@/types/graphql";
import ICommunityPortalConfigRepository from "@/application/domain/account/community/config/portal/data/interface";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import ImageService from "@/application/domain/content/image/service";

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

const DEFAULT_ENABLE_FEATURES = ["points", "justDaoIt", "languageSwitcher"];

// Fallback defaults for the create path when no portal config exists yet
const PORTAL_CONFIG_CREATE_DEFAULTS: Prisma.CommunityPortalConfigCreateWithoutConfigInput = {
  tokenName: "",
  title: "",
  description: "",
  domain: "",
  faviconPrefix: "",
  logoPath: "",
  squareLogoPath: "",
  ogImagePath: "",
  enableFeatures: DEFAULT_ENABLE_FEATURES,
  rootPath: "/",
  adminRootPath: "/admin",
};

@injectable()
export default class CommunityPortalConfigService {
  constructor(
    @inject("CommunityPortalConfigRepository")
    private readonly portalRepository: ICommunityPortalConfigRepository,
    @inject("CommunityConfigRepository")
    private readonly configRepository: ICommunityConfigRepository,
    @inject("ImageService")
    private readonly imageService: ImageService,
  ) {}

  async update(
    ctx: IContext,
    communityId: string,
    input: GqlCommunityPortalConfigInput,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
<<<<<<< HEAD
    // GCS アップロード（並列実行、トランザクション外で実行）
    const [uploadedLogo, uploadedSquareLogo, uploadedFavicon] = await Promise.all([
      input.logo       ? this.imageService.uploadPublicImage(input.logo,       "community-portal") : Promise.resolve(null),
      input.squareLogo ? this.imageService.uploadPublicImage(input.squareLogo, "community-portal") : Promise.resolve(null),
      input.favicon    ? this.imageService.uploadPublicImage(input.favicon,    "community-portal") : Promise.resolve(null),
    ]);
=======
    // ogImage (file upload) takes priority over ogImagePath (legacy string)
    let resolvedOgImagePath: string | undefined;
    if (input.ogImage != null) {
      const result = await this.imageService.uploadPublicImage(input.ogImage, "community-portal");
      if (result) resolvedOgImagePath = result.url;
    } else if (input.ogImagePath != null) {
      resolvedOgImagePath = input.ogImagePath;
    }
>>>>>>> 1bbf14fcf65e435090b57ceba642d2a92e3f37a6

    // Plain values only — avoids type incompatibility between UpdateInput and CreateInput
    const plainValues: Partial<Prisma.CommunityPortalConfigCreateWithoutConfigInput> = {
      ...(input.tokenName       != null && { tokenName: input.tokenName }),
      ...(input.title           != null && { title: input.title }),
      ...(input.description     != null && { description: input.description }),
      ...(input.shortDescription !== undefined && { shortDescription: input.shortDescription }),
      ...(input.domain          != null && { domain: input.domain }),
      ...(input.faviconPrefix   != null && { faviconPrefix: input.faviconPrefix }),
      ...(uploadedFavicon       != null && { faviconPrefix: uploadedFavicon.url }),
      ...(input.logoPath        != null && { logoPath: input.logoPath }),
      ...(uploadedLogo          != null && { logoPath: uploadedLogo.url }),
      ...(input.squareLogoPath  != null && { squareLogoPath: input.squareLogoPath }),
<<<<<<< HEAD
      ...(uploadedSquareLogo    != null && { squareLogoPath: uploadedSquareLogo.url }),
      ...(input.ogImagePath     != null && { ogImagePath: input.ogImagePath }),
=======
      ...(resolvedOgImagePath   != null && { ogImagePath: resolvedOgImagePath }),
>>>>>>> 1bbf14fcf65e435090b57ceba642d2a92e3f37a6
      ...(input.enableFeatures  != null && { enableFeatures: input.enableFeatures }),
      ...(input.rootPath        != null && { rootPath: input.rootPath }),
      ...(input.adminRootPath   != null && { adminRootPath: input.adminRootPath }),
      ...(input.regionName      !== undefined && { regionName: input.regionName }),
      ...(input.regionKey       !== undefined && { regionKey: input.regionKey }),
      // DbNull = SQL NULL（列を null にする）。JsonNull は JSON リテラルの null を格納するため不適切
      ...(input.documents !== undefined && { documents: input.documents ?? Prisma.DbNull }),
      ...(input.commonDocumentOverrides !== undefined && {
        commonDocumentOverrides: input.commonDocumentOverrides ?? Prisma.DbNull,
      }),
    };

    const updateData: Prisma.CommunityPortalConfigUpdateWithoutConfigInput = plainValues;
    // create path: defaults + input values to satisfy NOT NULL constraints
    const createData: Prisma.CommunityPortalConfigCreateWithoutConfigInput = {
      ...PORTAL_CONFIG_CREATE_DEFAULTS,
      ...plainValues,
    };

    await this.portalRepository.upsert(ctx, communityId, createData, updateData, tx);
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
