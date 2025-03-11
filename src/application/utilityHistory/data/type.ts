import { Prisma } from "@prisma/client";
import { walletInclude } from "@/application/wallet/data/type";
import { utilityInclude } from "@/application/utility/data/type";
import { transactionInclude } from "@/application/transaction/data/type";

export const utilityHistoryInclude = Prisma.validator<Prisma.UtilityHistoryInclude>()({
  wallet: { include: walletInclude },
  utility: { include: utilityInclude },
  transaction: { include: transactionInclude },
});

export type UtilityHistoryPayloadWithArgs = Prisma.UtilityHistoryGetPayload<{
  include: typeof utilityHistoryInclude;
}>;
