import {
  GqlArticle,
  GqlArticleFilterInput,
  GqlArticlesConnection,
  GqlQueryArticleArgs,
  GqlQueryArticlesArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ArticleService from "@/application/domain/article/service";
import ArticlePresenter from "@/application/domain/article/presenter";
import { PublishStatus } from "@prisma/client";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";
import { articleInclude } from "@/application/domain/article/data/type";

export default class ArticleUseCase {
  static async anyoneBrowseArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesArgs,
  ): Promise<GqlArticlesConnection> {
    const take = clampFirst(first);

    const currentUserId = ctx.currentUser?.id;
    const communityIds = ctx.hasPermissions?.memberships?.map((m) => m.communityId) || [];

    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);
    const allowedPublishStatuses = isManager
      ? Object.values(PublishStatus)
      : isMember
        ? [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL]
        : [PublishStatus.PUBLIC];

    await ArticleService.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter: GqlArticleFilterInput = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    const records = await ArticleService.fetchArticles(
      ctx,
      {
        cursor,
        sort,
        filter: validatedFilter,
      },
      take,
      articleInclude,
    );

    const hasNextPage = records.length > take;
    const data = records.slice(0, take).map((record) => ArticlePresenter.get(record));
    return ArticlePresenter.query(data, hasNextPage);
  }

  static async visitorViewArticle(
    ctx: IContext,
    { id, permission }: GqlQueryArticleArgs,
  ): Promise<GqlArticle | null> {
    const currentUserId = ctx.currentUser?.id;
    const communityIds = [permission.communityId];
    const { isManager, isMember } = getMembershipRolesByCtx(ctx, communityIds, currentUserId);

    const validatedFilter = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
    );

    const record = await ArticleService.findArticle(ctx, id, validatedFilter);
    return record ? ArticlePresenter.get(record) : null;
  }
}

function validateByMembershipRoles(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlArticleFilterInput,
): GqlArticleFilterInput {
  if (communityIds.length === 0) {
    return {
      and: [{ publishStatus: [PublishStatus.PUBLIC] }, ...(filter ? [filter] : [])],
    };
  }

  const orConditions: GqlArticleFilterInput[] = communityIds.map((communityId) => {
    if (isManager[communityId]) {
      return {
        and: [{ communityId }, ...(filter ? [filter] : [])],
      };
    }
    return {
      and: [
        { communityId },
        {
          or: [
            { publishStatus: [PublishStatus.PUBLIC] },
            ...(isMember[communityId]
              ? [{ publishStatus: [PublishStatus.COMMUNITY_INTERNAL] }]
              : []),
            ...(currentUserId
              ? [{ authors: [currentUserId] }, { relatedUserIds: [currentUserId] }]
              : []),
          ],
        },
        ...(filter ? [filter] : []),
      ],
    };
  });

  return orConditions.length > 0 ? { or: orConditions } : {};
}
