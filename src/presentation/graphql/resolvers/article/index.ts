import ArticleUseCase from "@/app/article/usecase";
import {
  GqlQueryArticlesArgs,
  GqlQueryArticleArgs,
  GqlMutationArticleCreateArgs,
  GqlMutationArticleUpdateArgs,
  GqlMutationArticleDeleteArgs,
  GqlArticle,
  GqlArticleOpportunitiesArgs,
  GqlOpportunitiesConnection,
  GqlArticleAuthorsArgs,
  GqlArticleRelatedUsersArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import OpportunityUseCase from "@/app/opportunity/usecase";
import UserUseCase from "@/app/user/usecase";

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
  Mutation: {
    articleCreate: async (_: unknown, args: GqlMutationArticleCreateArgs, ctx: IContext) =>
      ArticleUseCase.managerCreateArticle(ctx, args),
    articleUpdate: async (_: unknown, args: GqlMutationArticleUpdateArgs, ctx: IContext) =>
      ArticleUseCase.managerUpdateArticle(ctx, args),
    articleDelete: async (_: unknown, args: GqlMutationArticleDeleteArgs, ctx: IContext) =>
      ArticleUseCase.managerDeleteArticle(ctx, args),
  },
  Article: {
    opportunities: async (
      parent: GqlArticle,
      args: GqlArticleOpportunitiesArgs,
      ctx: IContext,
    ): Promise<GqlOpportunitiesConnection> => {
      return OpportunityUseCase.visitorBrowseOpportunitiesByArticle(parent, args, ctx);
    },
    authors: async (parent: GqlArticle, args: GqlArticleAuthorsArgs, ctx: IContext) => {
      return UserUseCase.visitorBrowseArticleAuthors(ctx, parent, args);
    },
    relatedUsers: async (parent: GqlArticle, args: GqlArticleRelatedUsersArgs, ctx: IContext) => {
      return UserUseCase.visitorBrowseArticleRelatedUsers(ctx, parent, args);
    },
  },
};

export default articleResolver;
