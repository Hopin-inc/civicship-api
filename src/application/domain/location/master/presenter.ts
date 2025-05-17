import { PrismaCityDetail } from "@/application/domain/location/master/data/type";
import { GqlCity } from "@/types/graphql";

export default class MasterPresenter {
  static get(r: PrismaCityDetail): GqlCity {
    return {
      __typename: "City",
      ...r,
    };
  }
}
