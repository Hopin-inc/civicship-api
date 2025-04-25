import { GqlMembershipHistory } from "@/types/graphql";
import { PrismaMembershipHistory } from "@/application/domain/account/membership/history/data/type";

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
