import MasterRepository from "@/infrastructure/prisma/repositories/master";

export default class MasterService {
  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new Error(`City with ID ${id} not found`);
    }
    return city;
  }
}
