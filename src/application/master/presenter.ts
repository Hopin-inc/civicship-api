import { PrismaCity } from "@/application/master/data/type";
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
