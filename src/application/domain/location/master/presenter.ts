import { PrismaCity } from "@/application/domain/location/master/data/type";
import { GqlCity } from "@/types/graphql";

export default class MasterPresenter {
  static getCity(r: PrismaCity): GqlCity {
    const { state, ...prop } = r;

    return {
      ...prop,
      state,
    };
  }
}
