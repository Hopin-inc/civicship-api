import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { 
  GqlQueryArticlesArgs, 
  GqlQueryArticleArgs,
  GqlMutationArticleCreateArgs,
  GqlMutationArticleUpdateContentArgs,
  GqlMutationArticleDeleteArgs
} from "@/types/graphql";
import ArticleUseCase from "@/application/domain/content/article/usecase";

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
    thumbnail: (parent, _: unknown, ctx: IContext) => {
      return parent.thumbnailId ? ctx.loaders.image.load(parent.thumbnailId) : null;
    },

    community: (parent, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },

    authors: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.authorsByArticle.load(parent.id);
    },

    relatedUsers: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.relatedUsersByArticle.load(parent.id);
    },

    opportunities: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.opportunitiesByArticle.load(parent.id);
    },
  };

  Mutation = {
    articleCreate: (_: unknown, args: GqlMutationArticleCreateArgs, ctx: IContext) => {
      return this.articleUseCase.managerCreateArticle(args, ctx);
    },
    articleUpdateContent: (_: unknown, args: GqlMutationArticleUpdateContentArgs, ctx: IContext) => {
      return this.articleUseCase.managerUpdateArticleContent(args, ctx);
    },
    articleDelete: (_: unknown, args: GqlMutationArticleDeleteArgs, ctx: IContext) => {
      return this.articleUseCase.managerDeleteArticle(args, ctx);
    },
  };
}
