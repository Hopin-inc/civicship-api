import * as ArticleLoaders from "@/application/domain/content/article/controller/dataloader";
import * as ImageLoaders from "@/application/domain/content/image/controller/dataloader";
import { PrismaClient } from "@prisma/client";

export function createContentLoaders(prisma: PrismaClient) {
  return {
    article: ArticleLoaders.createArticleLoader(prisma),
    articlesByOpportunity: ArticleLoaders.createArticlesByOpportunityLoader(prisma),
    articlesWrittenByMe: ArticleLoaders.createArticlesWrittenByMeLoader(prisma),
    articlesAboutMe: ArticleLoaders.createArticlesAboutMeLoader(prisma),
    articlesByCommunity: ArticleLoaders.createArticlesByCommunityLoader(prisma),

    image: ImageLoaders.createImageLoader(prisma),
    imagesByParticipation: ImageLoaders.createImagesByParticipationLoader(prisma),
    imagesByOpportunity: ImageLoaders.createImagesByOpportunityLoader(prisma),
    imagesByUtility: ImageLoaders.createImagesByUtilityLoader(prisma),
  };
}
