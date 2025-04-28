import MembershipRepository from "@/application/domain/account/membership/data/repository";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MembershipService from "@/application/domain/account/membership/service";
import { createWalletService } from "@/application/domain/account/wallet/provider";
import NotificationService from "@/application/domain/notification/service";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import MembershipConverter from "@/application/domain/account/membership/data/converter";
import { getCurrentUserId } from "@/application/domain/utils";

export function createMembershipService(issuer: PrismaClientIssuer) {
  const repository = new MembershipRepository(issuer);
  const converter = new MembershipConverter();
  return new MembershipService(repository, converter, getCurrentUserId);
}

export function createMembershipUseCase(issuer: PrismaClientIssuer) {
  const membershipService = createMembershipService(issuer);
  const walletService = createWalletService(issuer);
  const notificationService = new NotificationService();
  return new MembershipUseCase(issuer, membershipService, walletService, notificationService);
}
