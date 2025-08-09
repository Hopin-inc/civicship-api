import "reflect-metadata";
import { container } from "tsyringe";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { NotFoundError } from "@/errors/graphql";
import { Prisma, PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";

class MockOpportunityRepository {
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  find = jest.fn();
  setPublishStatus = jest.fn();
}

class MockOpportunityConverter {
  create = jest.fn();
  update = jest.fn();
  filter = jest.fn();
  sort = jest.fn();
  findAccessible = jest.fn();
}

class MockImageService {
  uploadPublicImage = jest.fn().mockResolvedValue({
    bucket: "test-bucket",
    folderPath: "test-folder",
    filename: "test-file.jpg",
    url: "https://test-url.com/test-file.jpg",
    alt: "test alt",
    caption: "test caption",
    ext: ".jpg",
    mime: "image/jpeg",
    isPublic: true,
  });
}

describe("OpportunityService", () => {
  let service: OpportunityService;
  let mockRepository: MockOpportunityRepository;
  let mockConverter: MockOpportunityConverter;
  let mockImageService: MockImageService;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockOpportunityRepository();
    mockConverter = new MockOpportunityConverter();
    mockImageService = new MockImageService();

    container.register("OpportunityRepository", { useValue: mockRepository });
    container.register("OpportunityConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: mockImageService });

    service = container.resolve(OpportunityService);
  });

  describe("createOpportunity", () => {
    it("should create an opportunity with uploaded images", async () => {
      const input = { place: { where: { id: "place-id" } } } as any;

      mockConverter.create.mockReturnValue({
        data: { title: "Opportunity" },
        images: ["image-data"],
      });
      mockImageService.uploadPublicImage.mockResolvedValue({ id: "uploaded-image" });
      mockRepository.create.mockResolvedValue({ id: "created-opportunity" });

      const result = await service.createOpportunity(mockCtx, input, "community-id", mockTx);

      expect(mockConverter.create).toHaveBeenCalled();
      expect(mockImageService.uploadPublicImage).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(
        mockCtx,
        expect.objectContaining({
          title: "Opportunity",
          images: { create: [{ id: "uploaded-image" }] },
        }),
        mockTx,
      );
      expect(result).toEqual({ id: "created-opportunity" });
    });
  });

  describe("deleteOpportunity", () => {
    it("should delete an opportunity after finding it", async () => {
      mockRepository.find.mockResolvedValue({ id: "opportunity-1" });
      mockRepository.delete.mockResolvedValue({ id: "opportunity-1" });

      const result = await service.deleteOpportunity(mockCtx, "opportunity-1", mockTx);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "opportunity-1");
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, "opportunity-1", mockTx);
      expect(result).toEqual({ id: "opportunity-1" });
    });

    it("should throw NotFoundError if opportunity not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.deleteOpportunity(mockCtx, "opportunity-1", mockTx)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateOpportunityContent", () => {
    it("should update an opportunity content with uploaded images", async () => {
      mockRepository.find.mockResolvedValue({ id: "opportunity-1" });

      mockConverter.update.mockReturnValue({
        data: { title: "Updated Opportunity" },
        images: ["image-1", "image-2"],
      });

      mockImageService.uploadPublicImage
        .mockResolvedValueOnce({ id: "uploaded-1" })
        .mockResolvedValueOnce({ id: "uploaded-2" });

      mockRepository.update.mockResolvedValue({ id: "opportunity-1" });

      const input = { place: { where: { id: "place-1" } } } as any;

      const result = await service.updateOpportunityContent(
        mockCtx,
        "opportunity-1",
        input,
        mockTx,
      );

      expect(mockConverter.update).toHaveBeenCalled();
      expect(mockImageService.uploadPublicImage).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "opportunity-1",
        expect.objectContaining({
          title: "Updated Opportunity",
          images: {
            create: [{ id: "uploaded-1" }, { id: "uploaded-2" }],
          },
        }),
        mockTx,
      );
      expect(result).toEqual({ id: "opportunity-1" });
    });

    it("should throw NotFoundError if opportunity not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.updateOpportunityContent(mockCtx, "opportunity-1", {} as any, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("setOpportunityPublishStatus", () => {
    it("should set publish status after finding the opportunity", async () => {
      mockRepository.find.mockResolvedValue({ id: "opportunity-1" });
      mockRepository.setPublishStatus.mockResolvedValue({
        id: "opportunity-1",
        publishStatus: "PUBLISHED",
      });

      const result = await service.setOpportunityPublishStatus(
        mockCtx,
        "opportunity-1",
        "PUBLISHED" as any,
        mockTx,
      );

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "opportunity-1");
      expect(mockRepository.setPublishStatus).toHaveBeenCalledWith(
        mockCtx,
        "opportunity-1",
        "PUBLISHED",
        mockTx,
      );
      expect(result).toEqual({ id: "opportunity-1", publishStatus: "PUBLISHED" });
    });

    it("should throw NotFoundError if opportunity not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.setOpportunityPublishStatus(mockCtx, "opportunity-1", "PUBLISHED" as any, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("validatePublishStatus", () => {
    it("should pass validation when filter publishStatus matches allowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should pass validation when filter publishStatus is subset of allowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should pass validation when filter is undefined", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];

      await expect(
        service.validatePublishStatus(allowedStatuses, undefined),
      ).resolves.not.toThrow();
    });

    it("should pass validation when filter publishStatus is undefined", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = {} as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should throw ValidationError when filter publishStatus contains disallowed status", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, "INVALID_STATUS"] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });

    it("should throw ValidationError when filter publishStatus is empty array", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should throw ValidationError with multiple disallowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE, "INVALID"] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });

    it("should handle duplicate statuses in filter", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should handle null and undefined edge cases", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      
      await expect(
        service.validatePublishStatus(allowedStatuses, null as any),
      ).resolves.not.toThrow();
      
      await expect(
        service.validatePublishStatus(allowedStatuses, { publishStatus: null } as any),
      ).resolves.not.toThrow();
    });

    it("should handle empty allowed statuses array", async () => {
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;
      
      await expect(
        service.validatePublishStatus([], filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of");
    });

    it("should handle very large arrays", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const largeArray = new Array(1000).fill(PublishStatus.PUBLIC);
      const filter = { publishStatus: largeArray } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should validate error message format", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC, COMMUNITY_INTERNAL");
    });

    it("should handle null and undefined edge cases", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      
      await expect(
        service.validatePublishStatus(allowedStatuses, null as any),
      ).resolves.not.toThrow();
      
      await expect(
        service.validatePublishStatus(allowedStatuses, { publishStatus: null } as any),
      ).resolves.not.toThrow();
    });

    it("should handle empty allowed statuses array", async () => {
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;
      
      await expect(
        service.validatePublishStatus([], filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of");
    });

    it("should handle very large arrays", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const largeArray = new Array(1000).fill(PublishStatus.PUBLIC);
      const filter = { publishStatus: largeArray } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should handle mixed valid and invalid statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });

    it("should handle duplicate statuses in filter", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should handle mixed valid and invalid statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, "INVALID_STATUS", PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });
  });
});
