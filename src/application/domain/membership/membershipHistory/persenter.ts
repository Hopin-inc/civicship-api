import { GqlMembershipHistory } from "@/types/graphql";
import { PrismaMembershipHistory } from "@/application/domain/membership/membershipHistory/data/type";

export default class MembershipHistoryPresenter {
  static get(r: PrismaMembershipHistory): GqlMembershipHistory {
    const { membership, createdByUser, ...prop } = r;

    return {
      ...prop,
      membership,
      createdByUser,
    };
  }
}
