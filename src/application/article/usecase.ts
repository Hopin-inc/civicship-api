import {
  GqlQueryArticleArgs,
  GqlArticlesConnection,
  GqlArticle,
  GqlCommunity,
  GqlCommunityArticlesArgs,
  GqlQueryArticlesPublicArgs,
  GqlQueryArticlesCommunityInternalArgs,
  GqlQueryArticlesAllArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ArticleService from "@/application/article/service";
import ArticlePresenter from "@/application/article/presenter";
import { PublishStatus } from "@prisma/client";

export default class ArticleUseCase {
  static async visitorBrowsePublicArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesPublicArgs,
  ): Promise<GqlArticlesConnection> {
    await ArticleService.validatePublishStatus([PublishStatus.PUBLIC], filter);

    return ArticleService.fetchArticlesConnection(ctx, {
      cursor,
      sort,
      filter: {
        ...filter,
        publishStatus: [PublishStatus.PUBLIC],
      },
      first,
    });
  }

  static async memberBrowseCommunityInternalArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesCommunityInternalArgs,
  ): Promise<GqlArticlesConnection> {
    await ArticleService.validatePublishStatus(
      [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL],
      filter,
    );

    return ArticleService.fetchArticlesConnection(ctx, {
      cursor,
      sort,
      filter: {
        ...filter,
        publishStatus: [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL],
      },
      first,
    });
  }

  static async managerBrowseAllArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesAllArgs,
  ): Promise<GqlArticlesConnection> {
    return ArticleService.fetchArticlesConnection(ctx, {
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
    return ArticleService.fetchArticlesConnection(ctx, {
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
