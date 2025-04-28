import { GqlQueryArticleArgs, GqlQueryArticlesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import "reflect-metadata";
import { container } from "tsyringe";
import ArticleUseCase from "@/application/domain/content/article/usecase";

const articleUseCase = container.resolve(ArticleUseCase);

const articleResolver = {
  Query: {
    articles: async (_: unknown, args: GqlQueryArticlesArgs, ctx: IContext) =>
      articleUseCase.anyoneBrowseArticles(ctx, args),
    article: async (_: unknown, args: GqlQueryArticleArgs, ctx: IContext) => {
      if (!ctx.loaders?.article) {
        return articleUseCase.visitorViewArticle(ctx, args);
      }
      return ctx.loaders.article.load(args.id);
    },
  },
};

export default articleResolver;
