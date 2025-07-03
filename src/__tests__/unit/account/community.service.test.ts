import "reflect-metadata";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { container } from "tsyringe";
import CommunityService from "@/application/domain/account/community/service";
import { NotFoundError } from "@/errors/graphql";
import { MockImageService } from "@/__tests__/helper/mock-helper";
import ICommunityRepository from "@/application/domain/account/community/data/interface";
import { GqlCommunityCreateInput, GqlCommunityUpdateProfileInput, GqlSortDirection } from "@/types/graphql";
import CommunityConverter from "@/application/domain/account/community/data/converter";

enum MembershipStatus {
  PENDING = "PENDING",
  JOINED = "JOINED",
  LEFT = "LEFT",
}

enum MembershipStatusReason {
  CREATED_COMMUNITY = "CREATED_COMMUNITY",
  INVITED = "INVITED",
  CANCELED_INVITATION = "CANCELED_INVITATION",
  ACCEPTED_INVITATION = "ACCEPTED_INVITATION",
  DECLINED_INVITATION = "DECLINED_INVITATION",
  WITHDRAWN = "WITHDRAWN",
  REMOVED = "REMOVED",
  ASSIGNED = "ASSIGNED",
}

enum Role {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
}

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

    container.register("CommunityRepository", { useValue: mockRepository });
    container.register("CommunityConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: MockImageService });

    service = container.resolve(CommunityService);
  });

  describe("fetchCommunities", () => {
    it("should fetch communities with filter and sort", async () => {
      const args = {
        cursor: "cursor-123",
        filter: { keyword: "test" },
        sort: { createdAt: GqlSortDirection.Asc },
        first: 10,
      };
      const take = 10;
      const mockWhere = { name: { contains: "test" } };
      const mockOrderBy = { name: "asc" };
      const mockResult = [{ id: "community-1", name: "Test Community" }];

      mockConverter.filter.mockReturnValue(mockWhere);
      mockConverter.sort.mockReturnValue(mockOrderBy);
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchCommunities(mockCtx, args, take);

      expect(mockConverter.filter).toHaveBeenCalledWith(args.filter);
      expect(mockConverter.sort).toHaveBeenCalledWith(args.sort);
      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, mockWhere, mockOrderBy, take, args.cursor);
      expect(result).toEqual(mockResult);
    });

    it("should fetch communities with empty filter and sort when not provided", async () => {
      const args = { cursor: "cursor-123" };
      const take = 20;
      const mockWhere = {};
      const mockOrderBy = {};
      const mockResult = [];

      mockConverter.filter.mockReturnValue(mockWhere);
      mockConverter.sort.mockReturnValue(mockOrderBy);
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchCommunities(mockCtx, args, take);

      expect(mockConverter.filter).toHaveBeenCalledWith({});
      expect(mockConverter.sort).toHaveBeenCalledWith({});
      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, mockWhere, mockOrderBy, take, args.cursor);
      expect(result).toEqual(mockResult);
    });

    it("should handle repository query errors", async () => {
      const args = { cursor: "cursor-123", first: 10 };
      const take = 10;
      const error = new Error("Database query failed");

      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});
      mockRepository.query.mockRejectedValue(error);

      await expect(service.fetchCommunities(mockCtx, args, take)).rejects.toThrow("Database query failed");
    });

    it("should handle zero take parameter", async () => {
      const args = { cursor: "cursor-456", first: 0 };
      const take = 0;
      const mockResult = [];

      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});
      mockRepository.query.mockResolvedValue(mockResult);

      const result = await service.fetchCommunities(mockCtx, args, take);

      expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, 0, args.cursor);
      expect(result).toEqual(mockResult);
    });
  });

  describe("findCommunity", () => {
    it("should find community by id successfully", async () => {
      const communityId = "community-123";
      const mockCommunity = { id: communityId, name: "Test Community" };
      mockRepository.find.mockResolvedValue(mockCommunity);

      const result = await service.findCommunity(mockCtx, communityId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toEqual(mockCommunity);
    });

    it("should return null when community is not found", async () => {
      const communityId = "nonexistent-community";
      mockRepository.find.mockResolvedValue(null);

      const result = await service.findCommunity(mockCtx, communityId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toBeNull();
    });

    it("should handle empty community id", async () => {
      const communityId = "";
      mockRepository.find.mockResolvedValue(null);

      const result = await service.findCommunity(mockCtx, communityId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "");
      expect(result).toBeNull();
    });

    it("should handle repository errors", async () => {
      const communityId = "community-123";
      const error = new Error("Database connection failed");
      mockRepository.find.mockRejectedValue(error);

      await expect(service.findCommunity(mockCtx, communityId)).rejects.toThrow("Database connection failed");
    });
  });

  describe("findCommunityOrThrow", () => {
    it("should return community when found", async () => {
      const communityId = "community-123";
      const mockCommunity = { id: communityId, name: "Test Community" };
      mockRepository.find.mockResolvedValue(mockCommunity);

      const result = await service.findCommunityOrThrow(mockCtx, communityId);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toEqual(mockCommunity);
    });

    it("should throw NotFoundError when community is not found", async () => {
      const communityId = "nonexistent-community";
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.findCommunityOrThrow(mockCtx, communityId)
      ).rejects.toThrow(NotFoundError);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, communityId);
    });

    it("should throw NotFoundError with correct parameters", async () => {
      const communityId = "community-123";
      mockRepository.find.mockResolvedValue(null);

      try {
        await service.findCommunityOrThrow(mockCtx, communityId);
      } catch (error: any) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toContain("Community");
      }
    });
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

    it("should create a community with image upload", async () => {
      const input: GqlCommunityCreateInput = {
        name: "community-with-image",
        pointName: "points",
      };

      const mockImage = { file: "mock-image-file" };
      const convertedInput = { name: "community-with-image", pointName: "points" };
      const uploadedImageData = { url: "https://example.com/image.jpg" };
      const mockCommunity = { id: "community-1", ...convertedInput };
      const ctxWithUser = { currentUser: { id: "test-user" } } as IContext;

      mockConverter.create.mockReturnValue({ data: convertedInput, image: mockImage });
      MockImageService.uploadPublicImage.mockResolvedValue(uploadedImageData);
      mockRepository.create.mockResolvedValue(mockCommunity);

      const result = await service.createCommunityAndJoinAsOwner(
        ctxWithUser,
        input,
        {} as Prisma.TransactionClient,
      );

      expect(MockImageService.uploadPublicImage).toHaveBeenCalledWith(mockImage, "communities");
      expect(mockRepository.create).toHaveBeenCalledWith(
        ctxWithUser,
        expect.objectContaining({
          ...convertedInput,
          image: { create: uploadedImageData }
        }),
        expect.anything(),
      );
      expect(result).toEqual(mockCommunity);
    });

    it("should handle image upload failure", async () => {
      const input: GqlCommunityCreateInput = {
        name: "community-with-image",
        pointName: "points",
      };

      const mockImage = { file: "mock-image-file" };
      const convertedInput = { name: "community-with-image", pointName: "points" };
      const error = new Error("Image upload failed");
      const ctxWithUser = { currentUser: { id: "test-user" } } as IContext;

      mockConverter.create.mockReturnValue({ data: convertedInput, image: mockImage });
      MockImageService.uploadPublicImage.mockRejectedValue(error);

      await expect(
        service.createCommunityAndJoinAsOwner(ctxWithUser, input, {} as Prisma.TransactionClient)
      ).rejects.toThrow("Image upload failed");

      expect(MockImageService.uploadPublicImage).toHaveBeenCalledWith(mockImage, "communities");
    });

    it("should handle repository create failure", async () => {
      const input: GqlCommunityCreateInput = {
        name: "community-1",
        pointName: "point-1",
      };

      const convertedInput = { name: "community-1", pointName: "point-1" };
      const error = new Error("Database create failed");
      const ctxWithUser = { currentUser: { id: "test-user" } } as IContext;

      mockConverter.create.mockReturnValue({ data: convertedInput, image: undefined });
      mockRepository.create.mockRejectedValue(error);

      await expect(
        service.createCommunityAndJoinAsOwner(ctxWithUser, input, {} as Prisma.TransactionClient)
      ).rejects.toThrow("Database create failed");
    });

    it("should handle empty community name", async () => {
      const input: GqlCommunityCreateInput = {
        name: "",
        pointName: "points",
      };

      const convertedInput = { name: "", pointName: "points" };
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
      expect(result).toEqual(mockCommunity);
    });

    it("should handle empty point name", async () => {
      const input: GqlCommunityCreateInput = {
        name: "Test Community",
        pointName: "",
      };

      const convertedInput = { name: "Test Community", pointName: "" };
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

    it("should update community with image upload", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: { connectOrCreate: [], disconnect: undefined },
      };

      const mockImage = { file: "updated-image-file" };
      const uploadedImageData = { url: "https://example.com/updated-image.jpg" };
      const mockCommunity = { id: "community-1" };

      mockConverter.update.mockReturnValue({ data: updateInput, image: mockImage });
      mockRepository.find.mockResolvedValue(mockCommunity);
      MockImageService.uploadPublicImage.mockResolvedValue(uploadedImageData);
      mockRepository.update.mockResolvedValue(mockCommunity);

      const result = await service.updateCommunityProfile(
        mockCtx,
        "community-1",
        updateInput,
        mockTx,
      );

      expect(MockImageService.uploadPublicImage).toHaveBeenCalledWith(mockImage, "communities");
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "community-1",
        expect.objectContaining({
          ...updateInput,
          image: { create: uploadedImageData }
        }),
        mockTx,
      );
      expect(result).toEqual(mockCommunity);
    });

    it("should handle image upload failure during update", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: { connectOrCreate: [], disconnect: undefined },
      };

      const mockImage = { file: "updated-image-file" };
      const error = new Error("Image upload failed");
      const mockCommunity = { id: "community-1" };

      mockConverter.update.mockReturnValue({ data: updateInput, image: mockImage });
      mockRepository.find.mockResolvedValue(mockCommunity);
      MockImageService.uploadPublicImage.mockRejectedValue(error);

      await expect(
        service.updateCommunityProfile(mockCtx, "community-1", updateInput, mockTx)
      ).rejects.toThrow("Image upload failed");

      expect(MockImageService.uploadPublicImage).toHaveBeenCalledWith(mockImage, "communities");
    });

    it("should handle repository update failure", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: { connectOrCreate: [], disconnect: undefined },
      };

      const mockCommunity = { id: "community-1" };
      const error = new Error("Database update failed");

      mockConverter.update.mockReturnValue({ data: updateInput, image: undefined });
      mockRepository.find.mockResolvedValue(mockCommunity);
      mockRepository.update.mockRejectedValue(error);

      await expect(
        service.updateCommunityProfile(mockCtx, "community-1", updateInput, mockTx)
      ).rejects.toThrow("Database update failed");
    });

    it("should validate places input and throw ValidationError for invalid connectOrCreate", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: {
          connectOrCreate: [
            { 
              where: "place-1", 
              create: { 
                name: "New Place",
                address: "123 Test St",
                cityCode: "12345",
                isManual: true,
                latitude: "35.6762",
                longitude: "139.6503"
              } 
            }
          ],
          disconnect: undefined
        },
      };

      const mockCommunity = { id: "community-1" };
      mockRepository.find.mockResolvedValue(mockCommunity);

      await expect(
        service.updateCommunityProfile(mockCtx, "community-1", updateInput, mockTx)
      ).rejects.toThrow("For each Place, choose only one of \"where\" or \"create.\"");
    });

    it("should validate places input and throw ValidationError for missing both where and create", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: {
          connectOrCreate: [
            { where: undefined, create: undefined }
          ],
          disconnect: undefined
        },
      };

      const mockCommunity = { id: "community-1" };
      mockRepository.find.mockResolvedValue(mockCommunity);

      await expect(
        service.updateCommunityProfile(mockCtx, "community-1", updateInput, mockTx)
      ).rejects.toThrow("For each Place, choose only one of \"where\" or \"create.\"");
    });

    it("should successfully validate places input with only where", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: {
          connectOrCreate: [
            { where: "place-1", create: undefined }
          ],
          disconnect: undefined
        },
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

      expect(result).toEqual(mockCommunity);
    });

    it("should successfully validate places input with only create", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: {
          connectOrCreate: [
            { 
              where: undefined, 
              create: { 
                name: "New Place",
                address: "456 Test Ave",
                cityCode: "67890",
                isManual: false,
                latitude: "35.6895",
                longitude: "139.6917"
              } 
            }
          ],
          disconnect: undefined
        },
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

      expect(result).toEqual(mockCommunity);
    });

    it("should handle empty places connectOrCreate array", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: {
          connectOrCreate: [],
          disconnect: undefined
        },
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

      expect(result).toEqual(mockCommunity);
    });

    it("should handle undefined places", async () => {
      const updateInput: GqlCommunityUpdateProfileInput = {
        name: "Updated Community",
        pointName: "Updated Points",
        places: {
          connectOrCreate: [],
          disconnect: undefined
        },
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

    it("should handle repository delete failure", async () => {
      const mockCommunity = { id: "community-1" };
      const error = new Error("Database delete failed");

      mockRepository.find.mockResolvedValue(mockCommunity);
      mockRepository.delete.mockRejectedValue(error);

      await expect(service.deleteCommunity(mockCtx, "community-1", mockTx)).rejects.toThrow("Database delete failed");

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "community-1");
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, "community-1", mockTx);
    });

    it("should handle empty community id", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.deleteCommunity(mockCtx, "", mockTx)).rejects.toThrow(NotFoundError);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "");
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
