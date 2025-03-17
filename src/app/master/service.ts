import MasterRepository from "@/infra/repositories/master";
import { NotFoundError } from "@/errors/graphql";

export default class MasterService {
  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new NotFoundError("City", { id });
    }
    return city;
  }
}
