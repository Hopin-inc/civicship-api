import {
  GqlArticle,
  GqlArticleFilterInput,
  GqlArticlesConnection,
  GqlCommunity,
  GqlCommunityArticlesArgs,
  GqlQueryArticleArgs,
  GqlQueryArticlesAllArgs,
  GqlQueryArticlesCommunityInternalArgs,
  GqlQueryArticlesPublicArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ArticleService from "@/application/article/service";
import ArticlePresenter from "@/application/article/presenter";
import { PublishStatus, Role } from "@prisma/client";
import { getCurrentUserId } from "@/utils";

export default class ArticleUseCase {
  static async visitorBrowsePublicArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesPublicArgs,
  ): Promise<GqlArticlesConnection> {
    await ArticleService.validatePublishStatus([PublishStatus.PUBLIC], filter);

    return ArticleService.fetchArticlesConnection(ctx, {
      cursor,
      sort,
      filter,
      first,
    });
  }

  static async memberBrowseCommunityInternalArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesCommunityInternalArgs,
  ): Promise<GqlArticlesConnection> {
    const currentUserId = getCurrentUserId(ctx);

    await ArticleService.validatePublishStatus(
      [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL],
      filter,
    );

    return ArticleService.fetchArticlesConnection(ctx, {
      cursor,
      sort,
      filter: {
        and: [
          {
            or: [{ authors: [currentUserId] }, { relatedUserIds: [currentUserId] }],
          },
          ...(filter ? [filter] : []),
        ],
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

  static async anyoneBrowseArticlesByCommunity(
    { id }: GqlCommunity,
    { first, cursor, filter }: GqlCommunityArticlesArgs,
    ctx: IContext,
  ): Promise<GqlArticlesConnection> {
    const currentUserId = ctx.currentUser?.id;

    const { isManager, isMember } = checkMembershipRole(ctx, id, currentUserId);
    await ArticleService.validatePublishStatus(
      isManager
        ? Object.values(PublishStatus)
        : isMember
          ? [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL]
          : [PublishStatus.PUBLIC],
      filter,
    );

    const validatedFilter: GqlArticleFilterInput = validateByPermission(
      id,
      currentUserId,
      isMember,
      isManager,
      filter,
    );

    return ArticleService.fetchArticlesConnection(ctx, {
      cursor,
      filter: validatedFilter,
      first,
    });
  }

  static async visitorViewArticle(
    ctx: IContext,
    { id, permissions }: GqlQueryArticleArgs,
  ): Promise<GqlArticle | null> {
    const currentUserId = ctx.currentUser?.id;
    const { isManager, isMember } = checkMembershipRole(
      ctx,
      permissions.communityId,
      currentUserId,
    );

    const validatedFilter = validateByPermission(id, currentUserId, isMember, isManager);

    const record = await ArticleService.findArticle(ctx, id, validatedFilter);
    return record ? ArticlePresenter.get(record) : null;
  }
}

function validateByPermission(
  communityId: string,
  currentUserId?: string,
  isMember?: boolean,
  isManager?: boolean,
  filter?: GqlArticleFilterInput,
): GqlArticleFilterInput {
  const orConditions: GqlArticleFilterInput[] = [
    { publishStatus: [PublishStatus.PUBLIC] },
    ...(isMember ? [{ publishStatus: [PublishStatus.COMMUNITY_INTERNAL] }] : []),
    ...(currentUserId ? [{ authors: [currentUserId] }, { relatedUserIds: [currentUserId] }] : []),
  ];

  return {
    and: [
      { communityId },
      isManager ? {} : { or: orConditions },
      ...(filter ? [filter] : []),
    ].filter(Boolean),
  };
}

function checkMembershipRole(
  ctx: IContext,
  communityId: string,
  currentUserId?: string,
): { isManager: boolean; isMember: boolean } {
  const isManager = Boolean(
    currentUserId &&
      ctx.hasPermissions?.memberships?.some(
        (m) => m.communityId === communityId && (m.role === Role.OWNER || m.role === Role.MANAGER),
      ),
  );

  const isMember = Boolean(
    currentUserId && ctx.hasPermissions?.memberships?.some((m) => m.communityId === communityId),
  );

  return { isManager, isMember };
}
