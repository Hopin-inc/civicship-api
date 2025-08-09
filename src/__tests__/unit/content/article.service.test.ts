import "reflect-metadata";
import { container } from "tsyringe";
import ArticleService from "@/application/domain/content/article/service";
import { ValidationError } from "@/errors/graphql";
import { PublishStatus } from "@prisma/client";

class MockArticleRepository {
  query = jest.fn();
  findAccessible = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
}

class MockArticleConverter {
  filter = jest.fn();
  sort = jest.fn();
  findAccessible = jest.fn();
  create = jest.fn();
  update = jest.fn();
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

describe("ArticleService", () => {
  let service: ArticleService;
  let mockRepository: MockArticleRepository;
  let mockConverter: MockArticleConverter;
  let mockImageService: MockImageService;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockArticleRepository();
    mockConverter = new MockArticleConverter();
    mockImageService = new MockImageService();

    container.register("ArticleRepository", { useValue: mockRepository });
    container.register("ArticleConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: mockImageService });

    service = container.resolve(ArticleService);
  });

  describe("validatePublishStatus", () => {
    it("should pass validation when filter publishStatus matches allowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should throw ValidationError for disallowed status", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow(ValidationError);
      
      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
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
      ).rejects.toThrow(ValidationError);
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
      ).rejects.toThrow(ValidationError);
      
      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC, COMMUNITY_INTERNAL");
    });

    it("should handle mixed valid and invalid statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PRIVATE, "INVALID"] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow(ValidationError);
    });

    it("should handle duplicate statuses in filter", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });
  });
});
