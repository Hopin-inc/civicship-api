import { PrismaIncentiveGrantDetail } from "./data/type";
import { GqlSignupBonus } from "@/types/graphql";

export default class IncentiveGrantPresenter {
  static toSignupBonus(r: PrismaIncentiveGrantDetail): GqlSignupBonus {
    return {
      __typename: "SignupBonus",
      ...r,
    } as GqlSignupBonus;
  }
}
