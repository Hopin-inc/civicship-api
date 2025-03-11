import { Prisma } from "@prisma/client";
import { walletInclude } from "@/infrastructure/prisma/types/membership/wallet";
import { utilityInclude } from "@/infrastructure/prisma/types/utility/index";
import { transactionInclude } from "@/infrastructure/prisma/types/transaction";

export const utilityHistoryInclude = Prisma.validator<Prisma.UtilityHistoryInclude>()({
  wallet: { include: walletInclude },
  utility: { include: utilityInclude },
  transaction: { include: transactionInclude },
});

export type UtilityHistoryPayloadWithArgs = Prisma.UtilityHistoryGetPayload<{
  include: typeof utilityHistoryInclude;
}>;
