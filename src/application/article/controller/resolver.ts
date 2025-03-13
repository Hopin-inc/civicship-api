import ArticleUseCase from "@/application/article/usecase";
import { GqlQueryArticlesArgs, GqlQueryArticleArgs } from "@/types/graphql";
import { IContext } from "@/types/server";

const articleResolver = {
  Query: {
    articles: async (_: unknown, args: GqlQueryArticlesArgs, ctx: IContext) =>
      ArticleUseCase.visitorBrowseArticles(ctx, args),
    article: async (_: unknown, args: GqlQueryArticleArgs, ctx: IContext) => {
      if (!ctx.loaders?.article) {
        return ArticleUseCase.visitorViewArticle(ctx, args);
      }
      return ctx.loaders.article.load(args.id);
    },
  },
};

export default articleResolver;
