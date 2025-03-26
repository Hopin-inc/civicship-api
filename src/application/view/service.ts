import { PrismaParticipationForPortfolio } from "@/application/domain/participation/data/type";

export default class ViewService {}

export type ValidParticipationForPortfolio = PrismaParticipationForPortfolio & {
  opportunitySlot: NonNullable<PrismaParticipationForPortfolio["opportunitySlot"]> & {
    opportunity: NonNullable<
      NonNullable<PrismaParticipationForPortfolio["opportunitySlot"]>["opportunity"]
    >;
  };
};
