import { Prisma } from "@prisma/client";
import { walletInclude } from "@/infra/prisma/types/membership/wallet";
import { utilityInclude } from "@/infra/prisma/types/utility/index";
import { transactionInclude } from "@/infra/prisma/types/transaction";

export const utilityHistoryInclude = Prisma.validator<Prisma.UtilityHistoryInclude>()({
  wallet: { include: walletInclude },
  utility: { include: utilityInclude },
  transaction: { include: transactionInclude },
});

export type UtilityHistoryPayloadWithArgs = Prisma.UtilityHistoryGetPayload<{
  include: typeof utilityHistoryInclude;
}>;
