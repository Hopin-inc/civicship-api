import { IContext } from "@/types/server";
import OpportunityRequiredUtilityRepository from "@/infra/prisma/repositories/opportunity/requiredUtility";
import { UtilityStatus } from "@prisma/client";

export default class OpportunityRequiredUtilityService {
  static async checkIfReservedUtilityExists(
    ctx: IContext,
    opportunityId: string,
    utilityId: string,
  ) {
    const reservedUtility = await OpportunityRequiredUtilityRepository.find(ctx, {
      opportunityId_utilityId: { utilityId, opportunityId },
      status: UtilityStatus.RESERVED,
    });
    if (!reservedUtility) {
      throw new Error("MemberWallet information is missing for points transfer");
    }

    return reservedUtility;
  }
}
