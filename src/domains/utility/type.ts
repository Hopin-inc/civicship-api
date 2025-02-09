import { Prisma } from "@prisma/client";
import { transactionInclude } from "../transaction/type";

export const utilityInclude = Prisma.validator<Prisma.UtilityInclude>()({
  community: {
    include: {
      city: {
        include: {
          state: true,
        },
      },
    },
  },
  transactions: { include: transactionInclude },
});

export type UtilityGetPayloadWithArgs = Prisma.UtilityGetPayload<{
  include: typeof utilityInclude;
}>;
