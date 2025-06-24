import {
  GqlVcIssuanceRequestsConnection,
  GqlVcIssuanceRequest,
  GqlQueryVcIssuanceRequestArgs,
  GqlQueryVcIssuanceRequestsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import { clampFirst } from "@/application/domain/utils";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import VCIssuanceRequestPresenter from "@/application/domain/experience/evaluation/vcIssuanceRequest/presenter";

@injectable()
export default class VCIssuanceRequestUseCase {
  constructor(
    @inject("VcIssuanceService")
    private readonly service: VCIssuanceRequestService,
  ) {}

  async visitorBrowseVcIssuanceRequests(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryVcIssuanceRequestsArgs,
  ): Promise<GqlVcIssuanceRequestsConnection> {
    const take = clampFirst(first);
    const requests = await this.service.fetchVcIssuanceRequests(
      ctx,
      { cursor, filter, sort },
      take,
    );

    const hasNextPage = requests.length > take;
    const data = requests.slice(0, take).map(VCIssuanceRequestPresenter.get);
    return VCIssuanceRequestPresenter.query(data, hasNextPage);
  }

  async visitorViewVcIssuanceRequest(
    ctx: IContext,
    { id }: GqlQueryVcIssuanceRequestArgs,
  ): Promise<GqlVcIssuanceRequest | null> {
    const request = await this.service.findVcIssuanceRequest(ctx, id);
    return request ? VCIssuanceRequestPresenter.get(request) : null;
  }
}
