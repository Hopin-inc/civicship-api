import {
  GqlQueryArticlesArgs,
  GqlQueryArticleArgs,
  GqlArticlesConnection,
  GqlArticle,
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
}
