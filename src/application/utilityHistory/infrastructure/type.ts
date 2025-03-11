import { Prisma } from "@prisma/client";
import { walletInclude } from "@/application/wallet/infrastructure/type";
import { utilityInclude } from "@/application/utility/infrastructure/type";
import { transactionInclude } from "@/application/transaction/infrastructure/type";

export const utilityHistoryInclude = Prisma.validator<Prisma.UtilityHistoryInclude>()({
  wallet: { include: walletInclude },
  utility: { include: utilityInclude },
  transaction: { include: transactionInclude },
});

export type UtilityHistoryPayloadWithArgs = Prisma.UtilityHistoryGetPayload<{
  include: typeof utilityHistoryInclude;
}>;
