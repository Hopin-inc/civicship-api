import { PrismaCity, PrismaCityDetail } from "@/application/domain/location/master/data/type";
import { GqlCity } from "@/types/graphql";

export default class MasterPresenter {
  static getCity(r: PrismaCity): GqlCity {
    const { state, ...prop } = r;

    return {
      ...prop,
      state,
    };
  }
  
  static get(r: PrismaCityDetail): GqlCity {
    return {
      code: r.code,
      name: r.name,
      state: r.state ? {
        code: r.state.code,
        name: r.state.name,
        countryCode: r.state.countryCode
      } : {
        code: "",
        name: "",
        countryCode: ""
      },
    };
  }
}
