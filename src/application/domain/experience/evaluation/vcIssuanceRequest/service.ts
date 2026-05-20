import { injectable, inject } from "tsyringe";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { IVCIssuanceRequestRepository } from "./data/interface";
import { PrismaVCIssuanceRequestDetail } from "./data/type";
import { GqlQueryVcIssuanceRequestsArgs } from "@/types/graphql";
import VCIssuanceRequestConverter from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";

@injectable()
export class VCIssuanceRequestService {
  constructor(
    @inject("VCIssuanceRequestConverter")
    private readonly converter: VCIssuanceRequestConverter,
    @inject("VCIssuanceRequestRepository")
    private readonly vcIssuanceRequestRepository: IVCIssuanceRequestRepository,
  ) {}

  async fetchVcIssuanceRequests(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryVcIssuanceRequestsArgs,
    take: number,
  ): Promise<PrismaVCIssuanceRequestDetail[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return await this.vcIssuanceRequestRepository.query(ctx, where, orderBy, take, cursor);
  }

  async findVcIssuanceRequest(
    ctx: IContext,
    id: string,
  ): Promise<PrismaVCIssuanceRequestDetail | null> {
    return await this.vcIssuanceRequestRepository.findById(ctx, id);
  }

  async bulkCreateVCIssuanceRequests(
    ctx: IContext,
    vcIssuanceData: Prisma.VcIssuanceRequestCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return this.vcIssuanceRequestRepository.createMany(ctx, vcIssuanceData);
  }
}
