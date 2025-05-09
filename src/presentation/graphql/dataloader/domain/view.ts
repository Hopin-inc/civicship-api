import * as ViewLoaders from "@/application/view/controller/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export function createViewLoaders(issuer: PrismaClientIssuer) {
  return {
    portfolioArticle: ViewLoaders.createPortfolioArticleLoader(issuer),
    portfolioParticipation: ViewLoaders.createPortfolioParticipationLoader(issuer),
  };
}
