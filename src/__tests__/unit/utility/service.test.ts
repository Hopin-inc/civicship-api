import UtilityService from "@/application/domain/utility/service";
import UtilityRepository from "@/application/domain/utility/data/repository";
import UtilityConverter from "@/application/domain/utility/data/converter";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";

jest.mock("@/application/domain/utility/data/converter");
jest.mock("@/application/domain/utility/data/repository");

describe("UtilityService", () => {
  const ctx = {} as IContext;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findUtility", () => {
    it("should return utility if found", async () => {
      const filter = { communityId: "c1" };
      const where = { id: "u1", AND: [{ communityId: "c1" }] };
      const mockUtility = { id: "u1" };

      (UtilityConverter.findAccessible as jest.Mock).mockReturnValue(where);
      (UtilityRepository.findAccessible as jest.Mock).mockResolvedValue(mockUtility);

      const result = await UtilityService.findUtility(ctx, "u1", filter);
      expect(result).toBe(mockUtility);
    });

    it("should return null if not found", async () => {
      (UtilityConverter.findAccessible as jest.Mock).mockReturnValue({});
      (UtilityRepository.findAccessible as jest.Mock).mockResolvedValue(null);

      const result = await UtilityService.findUtility(ctx, "unknown", {});
      expect(result).toBeNull();
    });
  });

  describe("findUtilityOrThrow", () => {
    it("should return utility if exists", async () => {
      const mockUtility = { id: "u1" };

      (UtilityRepository.find as jest.Mock).mockResolvedValue(mockUtility);

      const result = await UtilityService.findUtilityOrThrow(ctx, "u1");
      expect(result).toBe(mockUtility);
    });

    it("should throw NotFoundError if not found", async () => {
      (UtilityRepository.find as jest.Mock).mockResolvedValue(null);

      await expect(UtilityService.findUtilityOrThrow(ctx, "nope")).rejects.toThrow(NotFoundError);
    });
  });

  describe("createUtility", () => {
    it("should convert input and call repository.create", async () => {
      const input = {
        communityId: "c1",
        image: { base64: "data:image/png;base64,..." },
      };
      const data = { dummy: true };
      const created = { id: "u1" };

      (UtilityConverter.create as jest.Mock).mockReturnValue(data);
      (UtilityRepository.create as jest.Mock).mockResolvedValue(created);

      const result = await UtilityService.createUtility(ctx, input as any);
      expect(result).toBe(created);
      expect(UtilityConverter.create).toHaveBeenCalledWith(input);
      expect(UtilityRepository.create).toHaveBeenCalledWith(ctx, data);
    });
  });

  describe("deleteUtility", () => {
    it("should call findOrThrow and then delete", async () => {
      const id = "u1";
      const mockUtility = { id };

      jest.spyOn(UtilityService, "findUtilityOrThrow").mockResolvedValue(mockUtility as any);

      (UtilityRepository.delete as jest.Mock).mockResolvedValue({ id });

      const result = await UtilityService.deleteUtility(ctx, id);

      expect(UtilityService.findUtilityOrThrow).toHaveBeenCalledWith(ctx, id);
      expect(UtilityRepository.delete).toHaveBeenCalledWith(ctx, id);
      expect(result).toEqual({ id });
    });
  });

  describe("updateUtilityInfo", () => {
    it("should find utility, convert input and update", async () => {
      const args = {
        id: "u1",
        input: {
          name: "Updated",
          image: { base64: "new-img" },
        },
      };
      const converted = { name: "Updated", image: "new-img" };
      const updated = { id: "u1", ...converted };

      (UtilityRepository.find as jest.Mock).mockResolvedValue({ id: "u1" });
      (UtilityConverter.updateInfo as jest.Mock).mockReturnValue(converted);
      (UtilityRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await UtilityService.updateUtilityInfo(ctx, args as any);
      expect(result).toBe(updated);
    });
  });

  describe("validatePublishStatus", () => {
    it("should pass if all statuses are allowed", () => {
      expect(() =>
        UtilityService.validatePublishStatus([PublishStatus.PUBLIC], {
          publishStatus: [PublishStatus.PUBLIC],
        }),
      ).not.toThrow();
    });

    it("should throw if disallowed status is present", async () => {
      try {
        await UtilityService.validatePublishStatus([PublishStatus.PUBLIC], {
          publishStatus: [PublishStatus.PRIVATE],
        });
        fail("Expected ValidationError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(ValidationError);
        if (e instanceof ValidationError) {
          expect(e.message).toContain("must be one of PUBLIC");
          expect(e.invalidArgs).toContain('["PRIVATE"]');
        }
      }
    });
  });
});
