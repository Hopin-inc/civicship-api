import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
import UserService from "@/application/domain/account/user/service";
import UserRepository from "@/application/domain/account/user/data/repository";
import UserConverter from "@/application/domain/account/user/data/converter";
import ImageService from "@/application/domain/content/image/service";
import UserUseCase from "@/application/domain/account/user/usecase";

export function createUserService(issuer: PrismaClientIssuer): UserService {
  const repository = new UserRepository(issuer, prismaClient);
  const converter = new UserConverter();
  const imageService = new ImageService();
  return new UserService(repository, converter, imageService);
}

export function createUserUseCase(issuer: PrismaClientIssuer): UserUseCase {
  const service = createUserService(issuer);
  return new UserUseCase(issuer, service);
}
