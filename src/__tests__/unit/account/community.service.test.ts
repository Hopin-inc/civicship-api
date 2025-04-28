import "reflect-metadata";
import { IContext } from "@/types/server";
import { MembershipStatus, MembershipStatusReason, Prisma, Role } from "@prisma/client";
import { container } from "tsyringe";
import CommunityService from "@/application/domain/account/community/service";
import { NotFoundError } from "@/errors/graphql";
import { MockImageService } from "@/__tests__/helper/mock/image";
import { ICommunityRepository } from "@/application/domain/account/community/data/interface";
import { GqlCommunityCreateInput, GqlCommunityUpdateProfileInput } from "@/types/graphql";
import CommunityConverter from "@/application/domain/account/community/data/converter";

describe("CommunityService", () => {
  class MockCommunityRepository implements ICommunityRepository {
    query = jest.fn();
    find = jest.fn();
    create = jest.fn();
    update = jest.fn();
    delete = jest.fn();
  }

  class MockCommunityConverter extends CommunityConverter {
    create = jest.fn();
    update = jest.fn();
    filter = jest.fn();
    sort = jest.fn();
  }

  let mockRepository: MockCommunityRepository;
  let mockConverter: MockCommunityConverter;
  let service: CommunityService;

  const mockCtx = {} as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockCommunityRepository();
    mockConverter = new MockCommunityConverter();

    container.register("ICommunityRepository", { useValue: mockRepository });
    container.register("CommunityConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: MockImageService });

    service = container.resolve(CommunityService);
  });

  describe("createCommunityAndJoinAsOwner", () => {
    it("should create a community successfully", async () => {
      const input: GqlCommunityCreateInput = {
        name: "community-1",
        pointName: "point-1",
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
      const ctxWithUser = { currentUser: { id: "test-user" } } as IContext;

      mockConverter.create.mockReturnValue({ data: convertedInput, image: undefined });
      mockRepository.create.mockResolvedValue(mockCommunity);

      const result = await service.createCommunityAndJoinAsOwner(
        ctxWithUser,
        input,
        {} as Prisma.TransactionClient,
      );

      expect(mockConverter.create).toHaveBeenCalledWith(input, "test-user");
      expect(mockRepository.create).toHaveBeenCalledWith(
        ctxWithUser,
        expect.objectContaining({ ...convertedInput, image: { create: undefined } }),
        expect.anything(),
      );
      expect(result).toEqual(mockCommunity);
    });
  });

  describe("updateCommunityProfile", () => {
    it("should throw error if community is not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.updateCommunityProfile(
          mockCtx,
          "community-1",
          {} as GqlCommunityUpdateProfileInput,
          mockTx,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("should update an existing community", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: { connectOrCreate: [], disconnect: undefined },
      };

      const mockCommunity = { id: "community-1" };

      mockConverter.update.mockReturnValue({ data: updateInput, image: undefined });
      mockRepository.find.mockResolvedValue(mockCommunity);
      mockRepository.update.mockResolvedValue(mockCommunity);

      const result = await service.updateCommunityProfile(
        mockCtx,
        "community-1",
        updateInput,
        mockTx,
      );

      expect(mockConverter.update).toHaveBeenCalledWith(updateInput);
      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "community-1");
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "community-1",
        expect.objectContaining(updateInput),
        mockTx,
      );
      expect(result).toEqual(mockCommunity);
    });
  });

  describe("deleteCommunity", () => {
    it("should throw error if community is not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.deleteCommunity(mockCtx, "community-1", mockTx)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should delete a community", async () => {
      const mockCommunity = { id: "community-1" };

      mockRepository.find.mockResolvedValue(mockCommunity);
      mockRepository.delete.mockResolvedValue(mockCommunity);

      const result = await service.deleteCommunity(mockCtx, "community-1", mockTx);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "community-1");
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, "community-1", mockTx);
      expect(result).toEqual(mockCommunity);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
