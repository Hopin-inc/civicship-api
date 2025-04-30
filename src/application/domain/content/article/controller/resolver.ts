import { GqlQueryArticleArgs, GqlQueryArticlesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import "reflect-metadata";
import { container } from "tsyringe";
import ArticleUseCase from "@/application/domain/content/article/usecase";

const articleResolver = {
  Query: {
    articles: async (_: unknown, args: GqlQueryArticlesArgs, ctx: IContext) => {
      const usecase = container.resolve(ArticleUseCase);
      return usecase.anyoneBrowseArticles(ctx, args);
    },
    article: async (_: unknown, args: GqlQueryArticleArgs, ctx: IContext) => {
      const usecase = container.resolve(ArticleUseCase);
      return usecase.visitorViewArticle(ctx, args);
    },
  },
};

export default articleResolver;
