import { IContext } from "@/types/server";
import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import CommunityRepository from "@/application/domain/community/data/repository";
import CommunityService from "@/application/domain/community/service";
import { NotFoundError } from "@/errors/graphql";
import CommunityConverter from "@/application/domain/community/data/converter";

jest.mock("@/application/domain/community/data/repository");
jest.mock("@/application/domain/community/data/converter");

describe("CommunityService", () => {
  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCommunityAndJoinAsOwner", () => {
    it("should create a community successfully", async () => {
      const input = {
        bio: undefined,
        cityCode: "CITY_1",
        establishedAt: undefined,
        image: undefined,
        name: "community-1",
        pointName: "point-1",
        stateCode: "STATE_1",
        website: undefined,
      };

      const convertedInput = {
        ...input,
        memberships: {
          create: [
            {
              userId: "test-user",
              status: MembershipStatus.JOINED,
              reason: MembershipStatusReason.CREATED_COMMUNITY,
              role: Role.OWNER,
            },
          ],
        },
      };

      const mockCommunity = { id: "community-1", ...convertedInput };
      const mockCtx = {
        currentUser: {
          id: "test-user",
        },
      } as any;

      // [1] Converter をモック
      jest.mocked(CommunityConverter.create).mockReturnValue(convertedInput);

      // [2] Repository をモック
      (CommunityRepository.create as jest.Mock).mockResolvedValue(mockCommunity);

      // [3] 実行
      const result = await CommunityService.createCommunityAndJoinAsOwner(mockCtx, input, mockTx);

      // [4] 検証
      expect(CommunityConverter.create).toHaveBeenCalledWith(input, "test-user");
      expect(CommunityRepository.create).toHaveBeenCalledWith(mockCtx, convertedInput, mockTx);
      expect(result).toEqual(mockCommunity);
    });
  });

  describe("updateCommunityProfile", () => {
    it("should throw error if community is not found", async () => {
      const updateInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        communityId: "community-1",
        places: {
          connect: [],
          create: [
            {
              name: "Test Place",
              address: "123 Example St",
              isManual: true,
              latitude: "34.685",
              longitude: "135.805",
              city: { connect: { code: "city-1" } },
            },
          ],
          disconnect: undefined,
        },
      };

      const communityId = "community-1";
      (CommunityRepository.find as jest.Mock).mockResolvedValue(null);

      await expect(
        CommunityService.updateCommunityProfile(mockCtx, communityId, updateInput),
      ).rejects.toThrow(NotFoundError);
    });

    it("should update an existing community", async () => {
      const updateInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        communityId: "community-1",
        places: {
          connect: [],
          create: [
            {
              name: "Test Place",
              address: "123 Example St",
              isManual: true,
              latitude: "34.685",
              longitude: "135.805",
              city: { connect: { code: "city-1" } },
            },
          ],
          disconnect: undefined,
        },
      };

      const communityId = "community-1";
      const convertedInput = {
        name: updateInput.name,
        pointName: updateInput.pointName,
        places: updateInput.places,
      };

      const mockCommunity = { id: communityId, ...convertedInput };

      // [1] Converter をモック化
      jest.mocked(CommunityConverter.update).mockReturnValue(convertedInput);

      // [2] Repository をモック化
      (CommunityRepository.find as jest.Mock).mockResolvedValue(mockCommunity);
      (CommunityRepository.update as jest.Mock).mockResolvedValue(mockCommunity);

      // [3] 実行
      const result = await CommunityService.updateCommunityProfile(
        mockCtx,
        communityId,
        updateInput,
      );

      // [4] 検証
      expect(CommunityConverter.update).toHaveBeenCalledWith(updateInput);
      expect(CommunityRepository.find).toHaveBeenCalledWith(mockCtx, communityId);
      expect(CommunityRepository.update).toHaveBeenCalledWith(
        mockCtx,
        communityId,
        expect.objectContaining(convertedInput),
      );
      expect(result).toEqual(mockCommunity);
    });
  });
  describe("deleteCommunity", () => {
    it("should throw error if community is not found", async () => {
      const communityId = "community-1";

      (CommunityRepository.find as jest.Mock).mockResolvedValue(null);

      await expect(CommunityService.deleteCommunity(mockCtx, communityId)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should delete a community", async () => {
      const communityId = "community-1";

      const mockCommunity = { id: communityId, name: "Test Community", pointName: "Test Points" };
      (CommunityRepository.find as jest.Mock).mockResolvedValue(mockCommunity);
      (CommunityRepository.delete as jest.Mock).mockResolvedValue(mockCommunity);

      await CommunityService.deleteCommunity(mockCtx, communityId);

      expect(CommunityRepository.delete).toHaveBeenCalledWith(mockCtx, communityId);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
