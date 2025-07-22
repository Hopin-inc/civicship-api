import {
  GqlArticle,
  GqlArticleFilterInput,
  GqlArticlesConnection,
  GqlQueryArticleArgs,
  GqlQueryArticlesArgs,
  GqlMutationArticleCreateArgs,
  GqlMutationArticleUpdateContentArgs,
  GqlMutationArticleDeleteArgs,
  GqlArticleCreatePayload,
  GqlArticleUpdateContentPayload,
  GqlArticleDeletePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ArticleService from "@/application/domain/content/article/service";
import ArticlePresenter from "@/application/domain/content/article/presenter";
import { PublishStatus } from "@prisma/client";
import { clampFirst, getMembershipRolesByCtx } from "@/application/domain/utils";
import { articleInclude } from "@/application/domain/content/article/data/type";
import { injectable, inject } from "tsyringe";

@injectable()
export default class ArticleUseCase {
  constructor(@inject("ArticleService") private service: ArticleService) { }

  async anyoneBrowseArticles(
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

    await this.service.validatePublishStatus(allowedPublishStatuses, filter);

    const validatedFilter: GqlArticleFilterInput = validateByMembershipRoles(
      communityIds,
      isMember,
      isManager,
      currentUserId,
      filter,
    );

    const records = await this.service.fetchArticles(
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
    return ArticlePresenter.query(data, hasNextPage, cursor);
  }

  async visitorViewArticle(
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

    const record = await this.service.findArticle(ctx, id, validatedFilter);
    return record ? ArticlePresenter.get(record) : null;
  }

  async managerCreateArticle(
    { input, permission }: GqlMutationArticleCreateArgs,
    ctx: IContext,
  ): Promise<GqlArticleCreatePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.createArticle(ctx, input, permission.communityId, tx);
      return ArticlePresenter.create(record);
    });
  }

  async managerUpdateArticleContent(
    { id, input }: GqlMutationArticleUpdateContentArgs,
    ctx: IContext,
  ): Promise<GqlArticleUpdateContentPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.updateArticleContent(ctx, id, input, tx);
      return ArticlePresenter.update(record);
    });
  }

  async managerDeleteArticle(
    { id }: GqlMutationArticleDeleteArgs,
    ctx: IContext,
  ): Promise<GqlArticleDeletePayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const record = await this.service.deleteArticle(ctx, id, tx);
      return ArticlePresenter.delete(record);
    });
  }
}

function validateByMembershipRoles(
  communityIds: string[],
  isManager: Record<string, boolean>,
  isMember: Record<string, boolean>,
  currentUserId?: string,
  filter?: GqlArticleFilterInput,
): GqlArticleFilterInput {
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
