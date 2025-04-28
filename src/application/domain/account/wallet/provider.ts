import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import WalletRepository from "@/application/domain/account/wallet/data/repository";
import WalletConverter from "@/application/domain/account/wallet/data/converter";
import WalletService from "@/application/domain/account/wallet/service";
import WalletUseCase from "@/application/domain/account/wallet/usecase";

export function createWalletService(issuer: PrismaClientIssuer) {
  const repository = new WalletRepository(issuer);
  const converter = new WalletConverter();
  return new WalletService(repository, converter);
}

export function createWalletUseCase(issuer: PrismaClientIssuer) {
  const service = createWalletService(issuer);
  return new WalletUseCase(service);
}
