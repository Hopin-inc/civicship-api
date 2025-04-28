import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import UserRepository from "@/application/domain/account/user/data/repository";

import { prismaClient } from "@/infrastructure/prisma/client";
import { createMembershipService } from "@/application/domain/account/membership/provider";
import { createWalletService } from "@/application/domain/account/wallet/provider";
import ImageService from "@/application/domain/content/image/service";

export function createIdentityService(issuer: PrismaClientIssuer): IdentityService {
  const identityRepository = new IdentityRepository(prismaClient);
  const userRepository = new UserRepository(issuer, prismaClient);

  return new IdentityService(userRepository, identityRepository);
}

export function createIdentityUseCase(): IdentityUseCase {
  const issuer = new PrismaClientIssuer();

  const identityService = createIdentityService(issuer);
  const membershipService = createMembershipService(issuer);
  const walletService = createWalletService(issuer);
  const imageService = new ImageService();

  return new IdentityUseCase(
    issuer,
    identityService,
    membershipService,
    walletService,
    imageService,
  );
}
