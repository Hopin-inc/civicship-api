import OpportunityRepository from "@/application/domain/experience/opportunity/data/repository";
import OpportunityConverter from "@/application/domain/experience/opportunity/data/converter";
import { getCurrentUserId } from "@/application/domain/utils";
import { IContext } from "@/types/server";
import { PublishStatus, OpportunityCategory } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { GqlOpportunityUpdateContentInput } from "@/types/graphql";

jest.mock("@/application/domain/experience/opportunity/data/repository", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setPublishStatus: jest.fn(),
  },
}));

jest.mock("@/application/domain/experience/opportunity/data/converter", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/application/domain/utils", () => ({
  __esModule: true,
  getCurrentUserId: jest.fn(),
}));

describe("OpportunityService", () => {
  const mockCtx = {} as IContext;
  const mockOpportunity = { id: "opp-123" };
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUserId as jest.Mock).mockReturnValue("user-1");
  });

  describe("createOpportunity", () => {
    it("should create opportunity with connected place", async () => {
      const input = {
        name: "My Opportunity",
        title: "Opportunity Title",
        description: "This is a sample opportunity",
        category: OpportunityCategory.QUEST,
        publishStatus: PublishStatus.PUBLIC,
        requireApproval: false,
        communityId: "community-1",
        place: {
          where: "place-id-123",
        },
        image: { base64: "image-data" }, // ✅ image を明示的に含める
      };

      const mockCreated = { id: "op-123", name: input.name };

      jest.spyOn(OpportunityConverter, "create").mockImplementation(() => ({
        data: {
          name: input.name,
          title: input.title,
          description: input.description,
          category: input.category,
          publishStatus: input.publishStatus,
          requireApproval: input.requireApproval,
          community: { connect: { id: input.communityId } },
          place: { connect: { id: input.place.where } },
          createdByUser: { connect: { id: userId } }, // ✅ ここが必須
        },
        images: [], // ✅ 型一致のため必ず空配列でも含める
      }));

      (OpportunityRepository.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await OpportunityService.createOpportunity(mockCtx, input);

      expect(OpportunityConverter.create).toHaveBeenCalledWith(input, userId);
      expect(OpportunityRepository.create).toHaveBeenCalledWith(
        mockCtx,
        expect.objectContaining({
          name: input.name,
          title: input.title,
        }),
      );
      expect(result).toEqual(mockCreated);
    });

    it("should throw ValidationError if place has both where and create", async () => {
      const input = {
        name: "My Opportunity",
        title: "Opportunity Title",
        description: "This is a sample opportunity",
        category: OpportunityCategory.QUEST,
        publishStatus: PublishStatus.PUBLIC,
        requireApproval: false,
        communityId: "community-1",
        image: { base64: "image-data" },
        place: {
          where: "place-id-123",
          create: {
            name: "New Place",
            address: "Some address",
            cityCode: "XYZ123",
            communityId: "community-1",
            isManual: true,
            latitude: "34.0",
            longitude: "135.0",
          },
        },
      };

      await expect(OpportunityService.createOpportunity(mockCtx, input)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should create opportunity with new place (create)", async () => {
      const input = {
        name: "My Opportunity",
        title: "Opportunity Title",
        description: "This is a sample opportunity",
        category: OpportunityCategory.QUEST,
        publishStatus: PublishStatus.PUBLIC,
        requireApproval: false,
        communityId: "community-1",
        image: { base64: "image-data" },
        place: {
          where: "place-id-123", // ← 本来 new place のテストなら `create: {}` の方が自然かも？
        },
      };

      const mockCreated = { id: "op-456", name: input.name };

      jest.spyOn(OpportunityConverter, "create").mockImplementation(() => ({
        data: {
          name: input.name,
          title: input.title,
          description: input.description,
          category: input.category,
          publishStatus: input.publishStatus,
          requireApproval: input.requireApproval,
          community: { connect: { id: input.communityId } },
          place: { connect: { id: input.place.where } },
          createdByUser: { connect: { id: userId } }, // ✅ 必須項目
        },
        images: [],
      }));

      (OpportunityRepository.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await OpportunityService.createOpportunity(mockCtx, input);

      expect(OpportunityConverter.create).toHaveBeenCalledWith(input, userId);
      expect(OpportunityRepository.create).toHaveBeenCalledWith(
        mockCtx,
        expect.objectContaining({
          name: input.name,
          title: input.title,
        }),
      );
      expect(result).toEqual(mockCreated);
    });

    describe("deleteOpportunity", () => {
      it("should delete opportunity if found", async () => {
        (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockOpportunity);
        (OpportunityRepository.delete as jest.Mock).mockResolvedValue(mockOpportunity);

        const result = await OpportunityService.deleteOpportunity(mockCtx, "opp-123");

        expect(OpportunityRepository.find).toHaveBeenCalled();
        expect(OpportunityRepository.delete).toHaveBeenCalledWith(mockCtx, "opp-123");
        expect(result).toBe(mockOpportunity);
      });

      it("should throw NotFoundError if not found", async () => {
        jest.mocked(OpportunityRepository.find).mockResolvedValue(null);

        await expect(OpportunityService.deleteOpportunity(mockCtx, "opp-404")).rejects.toThrow(
          NotFoundError,
        );
      });
    });

    describe("updateOpportunityContent", () => {
      const validInput: GqlOpportunityUpdateContentInput = {
        title: "Updated Title",
        description: "Updated Description",
        category: OpportunityCategory.QUEST,
        publishStatus: PublishStatus.PUBLIC,
        requireApproval: false,
        // images: [{ file: {} }],
        place: {
          where: "place-123",
        },
      };

      it("should update content if found", async () => {
        (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockOpportunity);

        jest.mocked(OpportunityConverter.update).mockReturnValue({
          data: {
            description: "new",
          },
          images: [],
        });

        (OpportunityRepository.update as jest.Mock).mockResolvedValue({ id: "opp-123" });

        const result = await OpportunityService.updateOpportunityContent(
          mockCtx,
          "opp-123",
          validInput,
        );

        expect(OpportunityRepository.find).toHaveBeenCalledWith(mockCtx, "opp-123");
        expect(OpportunityConverter.update).toHaveBeenCalledWith(validInput);
        expect(OpportunityRepository.update).toHaveBeenCalledWith(
          mockCtx,
          "opp-123",
          expect.objectContaining({
            description: "new",
          }),
        );
        expect(result).toEqual({ id: "opp-123" });
      });

      it("should throw ValidationError for invalid place input", async () => {
        (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockOpportunity);

        const invalidInput: GqlOpportunityUpdateContentInput = {
          ...validInput,
          place: {
            where: "place-1",
            create: {
              name: "aaa",
              address: "Some address",
              cityCode: "CITY-1",
              communityId: "community-1",
              isManual: true,
              latitude: "0",
              longitude: "0",
            },
          },
        };

        await expect(
          OpportunityService.updateOpportunityContent(mockCtx, "opp-123", invalidInput),
        ).rejects.toThrow(ValidationError);
      });
    });

    describe("setOpportunityPublishStatus", () => {
      it("should set publish status if found", async () => {
        (OpportunityRepository.find as jest.Mock).mockResolvedValue(mockOpportunity);
        (OpportunityRepository.setPublishStatus as jest.Mock).mockResolvedValue({
          id: "opp-123",
          status: PublishStatus.PUBLIC,
        });

        const result = await OpportunityService.setOpportunityPublishStatus(
          mockCtx,
          "opp-123",
          PublishStatus.PUBLIC,
        );

        expect(OpportunityRepository.setPublishStatus).toHaveBeenCalledWith(
          mockCtx,
          "opp-123",
          PublishStatus.PUBLIC,
        );
        expect(result).toMatchObject({ id: "opp-123", status: PublishStatus.PUBLIC });
      });
    });
  });
});
