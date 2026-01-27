import {
  GqlMutationCommunityPortalConfigUpsertArgs,
  GqlCommunityPortalConfigUpsertPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import CommunityPortalConfigService from "@/application/domain/account/community/config/portal/service";
import CommunityPortalConfigPresenter from "@/application/domain/account/community/config/portal/presenter";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";

@injectable()
export default class CommunityPortalConfigUseCase {
  constructor(
    @inject("CommunityPortalConfigService")
    private readonly service: CommunityPortalConfigService,
    @inject("CommunityConfigRepository")
    private readonly configRepository: ICommunityConfigRepository,
  ) {}

  async ownerUpsertPortalConfig(
    { input, permission }: GqlMutationCommunityPortalConfigUpsertArgs,
    ctx: IContext,
  ): Promise<GqlCommunityPortalConfigUpsertPayload> {
    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx) => {
      const communityId = permission.communityId;

      const result = await this.service.upsertPortalConfig(ctx, input, communityId, tx);

      const [lineConfig, firebaseConfig] = await Promise.all([
        this.configRepository.getLineConfig(ctx, communityId),
        this.configRepository.getFirebaseConfig(ctx, communityId),
      ]);

      return CommunityPortalConfigPresenter.upsert(result, {
        communityId,
        liffId: lineConfig?.liffId,
        liffAppId: lineConfig?.liffAppId,
        liffBaseUrl: lineConfig?.liffBaseUrl,
        firebaseTenantId: firebaseConfig?.tenantId,
      });
    });
  }
}
