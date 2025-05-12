import * as ArticleLoaders from "@/application/domain/content/article/controller/dataloader";
import * as ImageLoaders from "@/application/domain/content/image/controller/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

export function createContentLoaders(issuer: PrismaClientIssuer) {
  return {
    article: ArticleLoaders.createArticleLoader(issuer),
    articlesByOpportunity: ArticleLoaders.createArticlesByOpportunityLoader(issuer),
    articlesWrittenByMe: ArticleLoaders.createArticlesWrittenByMeLoader(issuer),
    articlesAboutMe: ArticleLoaders.createArticlesAboutMeLoader(issuer),
    articlesByCommunity: ArticleLoaders.createArticlesByCommunityLoader(issuer),

    image: ImageLoaders.createImageLoader(issuer),
    imagesByParticipation: ImageLoaders.createImagesByParticipationLoader(issuer),
    imagesByOpportunity: ImageLoaders.createImagesByOpportunityLoader(issuer),
    imagesByUtility: ImageLoaders.createImagesByUtilityLoader(issuer),
  };
}
