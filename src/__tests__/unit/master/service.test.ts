import MasterService from "@/application/domain/master/service";
import MasterRepository from "@/application/domain/master/data/repository";

jest.mock("@/infra/repositories/master");

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

      await expect(MasterService.checkIfCityExists("456")).rejects.toThrow(
        "City with ID 456 not found",
      );

      expect(MasterRepository.checkCityExists).toHaveBeenCalledWith("456");
    });
  });
});
