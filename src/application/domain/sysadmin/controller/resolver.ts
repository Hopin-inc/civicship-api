import { inject, injectable } from "tsyringe";
import { IContext } from "@/types/server";
import SysAdminUseCase from "@/application/domain/sysadmin/usecase";
import {
  GqlQuerySysAdminCommunityDetailArgs,
  GqlQuerySysAdminDashboardArgs,
} from "@/types/graphql";

@injectable()
export default class SysAdminResolver {
  constructor(@inject("SysAdminUseCase") private readonly useCase: SysAdminUseCase) {}

  Query = {
    sysAdminDashboard: (_: unknown, args: GqlQuerySysAdminDashboardArgs, ctx: IContext) =>
      this.useCase.getDashboard(args, ctx),

    sysAdminCommunityDetail: (
      _: unknown,
      args: GqlQuerySysAdminCommunityDetailArgs,
      ctx: IContext,
    ) => this.useCase.getCommunityDetail(args, ctx),
  };
}
