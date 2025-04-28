import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ArticleRepository from "@/application/domain/content/article/data/repository";
import ArticleConverter from "@/application/domain/content/article/data/converter";
import ArticleService from "@/application/domain/content/article/service";
import ArticleUseCase from "@/application/domain/content/article/usecase";

export function createArticleService(issuer: PrismaClientIssuer) {
  const repository = new ArticleRepository(issuer);
  const converter = new ArticleConverter();
  return new ArticleService(repository, converter);
}

export function createArticleUseCase(issuer: PrismaClientIssuer) {
  const service = createArticleService(issuer);
  return new ArticleUseCase(service);
}
