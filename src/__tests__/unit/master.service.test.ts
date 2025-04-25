import MasterService from "@/application/domain/location/master/service";
import MasterRepository from "@/application/domain/location/master/data/repository";
import { NotFoundError } from "@/errors/graphql";

jest.mock("@/application/domain/location/master/data/repository");

describe("MasterService", () => {
  describe("checkIfCityExists", () => {
    it("should return the city if it exists", async () => {
      const mockCity = { id: "123", name: "Test City" };
      (MasterRepository.checkCityExists as jest.Mock).mockResolvedValue(mockCity);

      const result = await MasterService.checkIfCityExists("123");

      expect(result).toEqual(mockCity);
      expect(MasterRepository.checkCityExists).toHaveBeenCalledWith("123");
    });

    it("should throw an error if the city does not exist", async () => {
      (MasterRepository.checkCityExists as jest.Mock).mockResolvedValue(null);

      await expect(MasterService.checkIfCityExists("456")).rejects.toThrow(NotFoundError);

      expect(MasterRepository.checkCityExists).toHaveBeenCalledWith("456");
    });
  });
});
