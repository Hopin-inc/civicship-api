import {
  GqlMutationCommunityPortalConfigUpsertArgs,
  GqlCommunityPortalConfigUpsertPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import CommunityPortalConfigService from "@/application/domain/account/community/config/portal/service";
import CommunityPortalConfigPresenter from "@/application/domain/account/community/config/portal/presenter";

@injectable()
export default class CommunityPortalConfigUseCase {
  constructor(
    @inject("CommunityPortalConfigService")
    private readonly service: CommunityPortalConfigService,
  ) {}

  async ownerUpsertPortalConfig(
    { input, permission }: GqlMutationCommunityPortalConfigUpsertArgs,
    ctx: IContext,
  ): Promise<GqlCommunityPortalConfigUpsertPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const communityId = permission.communityId;

      const result = await this.service.upsertPortalConfig(ctx, input, communityId, tx);

      return CommunityPortalConfigPresenter.upsert(result, {
        communityId,
      });
    });
  }
}
