import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import { inject, injectable } from "tsyringe";
import { Prisma } from "@prisma/client";
import ICommunityPortalConfigRepository from "@/application/domain/account/community/config/portal/data/interface";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";
import CommunityPortalConfigConverter, {
  PortalConfigUploadedPaths,
} from "@/application/domain/account/community/config/portal/data/converter";
import {
  GqlCommunityPortalConfigUpsertInput,
  GqlCommunityDocumentInput,
  GqlImageInput,
} from "@/types/graphql";
import { PrismaCommunityPortalConfigDetail } from "@/application/domain/account/community/config/portal/data/type";
import ImageService from "@/application/domain/content/image/service";
import DocumentService from "@/application/domain/content/document/service";

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
    @inject("ImageService")
    private readonly imageService: ImageService,
    @inject("DocumentService")
    private readonly documentService: DocumentService,
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
      include: { portalConfig: true },
    });
    if (!config) {
      throw new NotFoundError("CommunityConfig not found", { communityId });
    }

    const existingPortalConfig = config.portalConfig;
    const folderPath = `portal/${communityId}`;

    // 画像アップロード処理
    const [faviconResult, logoResult, squareLogoResult, ogImageResult] = await Promise.all([
      this.uploadImageIfProvided(input.favicon, `${folderPath}/favicon`),
      this.uploadImageIfProvided(input.logo, `${folderPath}/logo`),
      this.uploadImageIfProvided(input.squareLogo, `${folderPath}/square-logo`),
      this.uploadImageIfProvided(input.ogImage, `${folderPath}/og-image`),
    ]);

    // ドキュメントアップロード処理
    const documents = await this.processDocuments(
      input.documents,
      existingPortalConfig?.documents as CommunityDocument[] | null,
      `${folderPath}/documents`,
    );

    const commonDocumentOverrides = await this.processCommonDocumentOverrides(
      input.commonDocumentOverrides,
      existingPortalConfig?.commonDocumentOverrides as CommonDocumentOverrides | null,
      `${folderPath}/documents`,
    );

    const uploadedPaths: PortalConfigUploadedPaths = {
      faviconPath: faviconResult ?? existingPortalConfig?.faviconPrefix ?? null,
      logoPath: logoResult ?? existingPortalConfig?.logoPath ?? null,
      squareLogoPath: squareLogoResult ?? existingPortalConfig?.squareLogoPath ?? null,
      ogImagePath: ogImageResult ?? existingPortalConfig?.ogImagePath ?? null,
      documents,
      commonDocumentOverrides,
    };

    const args = this.converter.upsert(input, config.id, uploadedPaths);
    return this.portalRepository.upsert(ctx, args, tx);
  }

  private async uploadImageIfProvided(
    imageInput: GqlImageInput | null | undefined,
    folderPath: string,
  ): Promise<string | null> {
    if (!imageInput?.file) {
      return null;
    }
    const result = await this.imageService.uploadPublicImage(imageInput, folderPath);
    return result?.url ?? null;
  }

  private async processDocuments(
    inputDocs: GqlCommunityDocumentInput[] | null | undefined,
    existingDocs: CommunityDocument[] | null,
    folderPath: string,
  ): Promise<CommunityDocument[] | null> {
    if (!inputDocs) {
      return existingDocs;
    }

    const processedDocs = await Promise.all(
      inputDocs.map(async (doc) => this.processDocument(doc, existingDocs, folderPath)),
    );

    return processedDocs;
  }

  private async processDocument(
    doc: GqlCommunityDocumentInput,
    existingDocs: CommunityDocument[] | null,
    folderPath: string,
  ): Promise<CommunityDocument> {
    // ファイルがあればアップロード、なければ既存パスまたは入力パスを使用
    let path = doc.path;
    if (doc.file) {
      const result = await this.documentService.uploadDocument(doc.file, folderPath);
      path = result?.url ?? doc.path ?? "";
    } else if (!path) {
      // 既存ドキュメントからパスを取得
      const existingDoc = existingDocs?.find((d) => d.id === doc.id);
      path = existingDoc?.path ?? "";
    }

    return {
      id: doc.id,
      title: doc.title,
      path: path ?? "",
      type: doc.type,
      order: doc.order ?? undefined,
    };
  }

  private async processCommonDocumentOverrides(
    input: { terms?: GqlCommunityDocumentInput | null; privacy?: GqlCommunityDocumentInput | null } | null | undefined,
    existing: CommonDocumentOverrides | null,
    folderPath: string,
  ): Promise<CommonDocumentOverrides | null> {
    if (!input) {
      return existing;
    }

    const result: CommonDocumentOverrides = {};

    if (input.terms) {
      result.terms = await this.processDocument(
        input.terms,
        existing?.terms ? [existing.terms] : null,
        folderPath,
      );
    } else if (existing?.terms) {
      result.terms = existing.terms;
    }

    if (input.privacy) {
      result.privacy = await this.processDocument(
        input.privacy,
        existing?.privacy ? [existing.privacy] : null,
        folderPath,
      );
    } else if (existing?.privacy) {
      result.privacy = existing.privacy;
    }

    return Object.keys(result).length > 0 ? result : null;
  }
}
