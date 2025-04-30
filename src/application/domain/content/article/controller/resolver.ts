import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlQueryArticlesArgs, GqlQueryArticleArgs } from "@/types/graphql";
import ArticleUseCase from "@/application/domain/content/article/usecase";

@injectable()
export default class ArticleResolver {
  constructor(@inject("ArticleUseCase") private readonly articleUseCase: ArticleUseCase) {}

  Query = {
    articles: (_: unknown, args: GqlQueryArticlesArgs, ctx: IContext) => {
      return this.articleUseCase.anyoneBrowseArticles(ctx, args);
    },
    article: (_: unknown, args: GqlQueryArticleArgs, ctx: IContext) => {
      return this.articleUseCase.visitorViewArticle(ctx, args);
    },
  };
}
