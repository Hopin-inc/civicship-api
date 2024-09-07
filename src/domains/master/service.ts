import MasterRepository from "@/domains/master/repository";

export default class MasterService {
  static async checkIfIndexExists(id: number) {
    const index = await MasterRepository.checkIndexExists(id);
    if (!index) {
      throw new Error(`Index with ID ${id} not found`);
    }
    return index;
  }

  static async checkIfSkillsetExists(id: number) {
    const skillset = await MasterRepository.checkSkillsetExists(id);
    if (!skillset) {
      throw new Error(`Skillset with ID ${id} not found`);
    }
    return skillset;
  }

  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new Error(`City with ID ${id} not found`);
    }
    return city;
  }

  static async checkIfIssueCategoryExists(id: number) {
    const category = await MasterRepository.checkIssueCategoryExists(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }
}
