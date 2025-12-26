import { GqlQueryCommunityPortalConfigArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import CommunityPortalConfigService from "@/application/domain/account/community/config/portal/service";

@injectable()
export default class CommunityPortalConfigResolver {
  constructor(
    @inject("CommunityPortalConfigService")
    private readonly portalConfigService: CommunityPortalConfigService,
  ) {}

  Query = {
    communityPortalConfig: async (
      _: unknown,
      args: GqlQueryCommunityPortalConfigArgs,
      ctx: IContext,
    ) => {
      return this.portalConfigService.getPortalConfig(ctx, args.communityId);
    },
  };
}
