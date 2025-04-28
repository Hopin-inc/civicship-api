import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import CommunityRepository from "@/application/domain/account/community/data/repository";
import CommunityConverter from "@/application/domain/account/community/data/converter";
import ImageService from "@/application/domain/content/image/service";
import CommunityService from "@/application/domain/account/community/service";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import { createWalletService } from "@/application/domain/account/wallet/provider";

export function createCommunityService(issuer: PrismaClientIssuer) {
  const repository = new CommunityRepository(issuer);
  const converter = new CommunityConverter();
  const imageService = new ImageService();
  return new CommunityService(repository, converter, imageService);
}

export function createCommunityUseCase(issuer: PrismaClientIssuer) {
  const communityService = createCommunityService(issuer);
  const walletService = createWalletService(issuer);
  return new CommunityUseCase(issuer, communityService, walletService);
}
