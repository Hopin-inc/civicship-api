import { NotFoundError } from "@/errors/graphql";
import MasterRepository from "@/application/master/data/repository";

export default class MasterService {
  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new NotFoundError("City", { id });
    }
    return city;
  }
}
