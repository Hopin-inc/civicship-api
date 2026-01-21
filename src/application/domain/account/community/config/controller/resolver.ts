import { GqlQuerySignupBonusConfigArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import CommunitySignupBonusConfigService from "@/application/domain/account/community/config/incentive/signup/service";

@injectable()
export default class CommunityConfigResolver {
  constructor(
    @inject("CommunitySignupBonusConfigService")
    private readonly signupBonusConfigService: CommunitySignupBonusConfigService,
  ) {}

  Query = {
    signupBonusConfig: async (
      _: unknown,
      args: GqlQuerySignupBonusConfigArgs,
      ctx: IContext,
    ) => {
      return this.signupBonusConfigService.get(ctx, args.communityId);
    },
  };
}
