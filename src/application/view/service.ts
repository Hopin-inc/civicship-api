import { PrismaParticipationForPortfolio } from "@/application/domain/experience/participation/data/type";

export default class ViewService {}

export type ValidParticipationForPortfolio = PrismaParticipationForPortfolio & {
  opportunitySlot: NonNullable<
    NonNullable<PrismaParticipationForPortfolio["reservation"]>["opportunitySlot"]
  > & {
    opportunity: NonNullable<
      NonNullable<PrismaParticipationForPortfolio["reservation"]>["opportunitySlot"]["opportunity"]
    >;
  };
};
