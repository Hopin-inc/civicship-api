import ArticleUseCase from "@/application/article/usecase";
import {
  GqlQueryArticleArgs,
  GqlQueryArticlesAllArgs,
  GqlQueryArticlesCommunityInternalArgs,
  GqlQueryArticlesPublicArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";

const articleResolver = {
  Query: {
    articlesPublic: async (_: unknown, args: GqlQueryArticlesPublicArgs, ctx: IContext) =>
      ArticleUseCase.visitorBrowsePublicArticles(ctx, args),
    articlesCommunityInternal: async (
      _: unknown,
      args: GqlQueryArticlesCommunityInternalArgs,
      ctx: IContext,
    ) => ArticleUseCase.memberBrowseCommunityInternalArticles(ctx, args),
    articlesAll: async (_: unknown, args: GqlQueryArticlesAllArgs, ctx: IContext) =>
      ArticleUseCase.managerBrowseAllArticles(ctx, args),
    article: async (_: unknown, args: GqlQueryArticleArgs, ctx: IContext) => {
      if (!ctx.loaders?.article) {
        return ArticleUseCase.visitorViewArticle(ctx, args);
      }
      return ctx.loaders.article.load(args.id);
    },
  },
};

export default articleResolver;
