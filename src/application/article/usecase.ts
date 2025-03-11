import {
  GqlQueryArticlesArgs,
  GqlQueryArticleArgs,
  GqlArticlesConnection,
  GqlArticle,
  GqlMutationArticleCreateArgs,
  GqlArticleCreatePayload,
  GqlMutationArticleDeleteArgs,
  GqlArticleDeletePayload,
  GqlMutationArticleUpdateArgs,
  GqlArticleUpdatePayload,
  GqlCommunity,
  GqlCommunityArticlesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ArticleService from "@/application/article/service";
import ArticlePresenter from "@/application/article/presenter";
import ArticleUtils from "@/application/article/utils";

export default class ArticleUseCase {
  static async visitorBrowseArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesArgs,
  ): Promise<GqlArticlesConnection> {
    return ArticleUtils.fetchArticlesCommon(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async visitorBrowseArticlesByCommunity(
    { id }: GqlCommunity,
    { first, cursor }: GqlCommunityArticlesArgs,
    ctx: IContext,
  ): Promise<GqlArticlesConnection> {
    return ArticleUtils.fetchArticlesCommon(ctx, {
      cursor,
      filter: { communityId: id },
      first,
    });
  }

  static async visitorViewArticle(
    ctx: IContext,
    { id }: GqlQueryArticleArgs,
  ): Promise<GqlArticle | null> {
    const record = await ArticleService.findArticle(ctx, id);
    return record ? ArticlePresenter.get(record) : null;
  }

  static async managerCreateArticle(
    ctx: IContext,
    { input }: GqlMutationArticleCreateArgs,
  ): Promise<GqlArticleCreatePayload> {
    const record = await ArticleService.createArticle(ctx, input);
    return ArticlePresenter.create(record);
  }

  static async managerUpdateArticle(
    ctx: IContext,
    { id, input }: GqlMutationArticleUpdateArgs,
  ): Promise<GqlArticleUpdatePayload> {
    const record = await ArticleService.updateArticle(ctx, id, input);
    return ArticlePresenter.update(record);
  }

  static async managerDeleteArticle(
    ctx: IContext,
    { id }: GqlMutationArticleDeleteArgs,
  ): Promise<GqlArticleDeletePayload> {
    const record = await ArticleService.deleteArticle(ctx, id);
    return ArticlePresenter.delete(record);
  }
}
