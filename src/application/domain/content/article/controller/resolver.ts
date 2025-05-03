import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlQueryArticlesArgs, GqlQueryArticleArgs } from "@/types/graphql";
import ArticleUseCase from "@/application/domain/content/article/usecase";
import { PrismaArticleDetail } from "@/application/domain/content/article/data/type";

@injectable()
export default class ArticleResolver {
  constructor(@inject("ArticleUseCase") private readonly articleUseCase: ArticleUseCase) {}

  Query = {
    articles: (_: unknown, args: GqlQueryArticlesArgs, ctx: IContext) => {
      return this.articleUseCase.anyoneBrowseArticles(ctx, args);
    },
    article: (_: unknown, args: GqlQueryArticleArgs, ctx: IContext) => {
      return ctx.loaders.article.load(args.id);
    },
  };
  
  Article = {
    community: (parent: PrismaArticleDetail, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },
    
    authors: (parent: PrismaArticleDetail, _: unknown, ctx: IContext) => {
      return parent.authors ? ctx.loaders.user.loadMany(parent.authors.map(a => a.id)) : [];
    },
    
    relatedUsers: (parent: PrismaArticleDetail, _: unknown, ctx: IContext) => {
      return parent.relatedUsers ? ctx.loaders.user.loadMany(parent.relatedUsers.map(u => u.id)) : [];
    },
    
    opportunities: (parent: PrismaArticleDetail, _: unknown, ctx: IContext) => {
      return parent.opportunities ? ctx.loaders.opportunity.loadMany(parent.opportunities.map(o => o.id)) : [];
    },
  };
}
