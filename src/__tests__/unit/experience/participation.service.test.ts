import "reflect-metadata";
import { container } from "tsyringe";
import ParticipationService from "@/application/domain/experience/participation/service";
import { ValidationError, NotFoundError } from "@/errors/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

class MockParticipationRepository {
  query = jest.fn();
  find = jest.fn();
  create = jest.fn();
  delete = jest.fn();
  update = jest.fn();
  bulkSetStatusByReservation = jest.fn();
}

class MockParticipationConverter {
  filter = jest.fn();
  sort = jest.fn();
  create = jest.fn();
  setStatus = jest.fn();
}

class MockImageService {
  uploadPublicImage = jest.fn();
}

describe("ParticipationService", () => {
  let service: ParticipationService;
  let mockRepository: MockParticipationRepository;
  let mockConverter: MockParticipationConverter;
  let mockImageService: MockImageService;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockParticipationRepository();
    mockConverter = new MockParticipationConverter();
    mockImageService = new MockImageService();

    container.register("ParticipationRepository", { useValue: mockRepository });
    container.register("ParticipationConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: mockImageService });

    service = container.resolve(ParticipationService);
  });

  describe("createParticipation", () => {
    it("should create participation with uploaded images", async () => {
      const input = { title: "My Participation" } as any;
      const createdData = { data: { userId: "test-user-id" }, images: ["img1", "img2"] };
      const uploadedImages = [{ id: "img-up-1" }, { id: "img-up-2" }];

      mockConverter.create.mockReturnValue(createdData);
      mockImageService.uploadPublicImage
        .mockResolvedValueOnce(uploadedImages[0])
        .mockResolvedValueOnce(uploadedImages[1]);
      mockRepository.create.mockResolvedValue({ id: "participation-1" });

      const result = await service.createParticipation(mockCtx, input, "test-user-id", mockTx);

      expect(mockConverter.create).toHaveBeenCalledWith(input, "test-user-id");
      expect(mockImageService.uploadPublicImage).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).toHaveBeenCalledWith(
        mockCtx,
        {
          ...createdData.data,
          images: { create: uploadedImages },
        },
        mockTx,
      );
      expect(result).toEqual({ id: "participation-1" });
    });
  });

  describe("deleteParticipation", () => {
    it("should delete after findOrThrow success", async () => {
      mockRepository.find.mockResolvedValue({ id: "p1" });
      mockRepository.delete.mockResolvedValue({ id: "p1" });

      const result = await service.deleteParticipation(mockCtx, "p1", mockTx);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "p1");
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, "p1", mockTx);
      expect(result).toEqual({ id: "p1" });
    });

    it("should throw NotFoundError if not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.deleteParticipation(mockCtx, "p1", mockTx)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("setStatus", () => {
    it("should update participation status", async () => {
      const id = "p1";
      const status = "JOINED" as any;
      const reason = "ATTENDED" as any;
      const updatedData = { status: "JOINED", reason: "ATTENDED" };

      mockConverter.setStatus.mockReturnValue(updatedData);
      mockRepository.update.mockResolvedValue({ id: "p1" });

      const result = await service.setStatus(mockCtx, id, status, reason, mockTx);

      expect(mockConverter.setStatus).toHaveBeenCalledWith("test-user-id", status, reason);
      expect(mockRepository.update).toHaveBeenCalledWith(mockCtx, id, updatedData, mockTx);
      expect(result).toEqual({ id: "p1" });
    });
  });

  describe("bulkSetStatusByReservation", () => {
    it("should bulk set status by reservation", async () => {
      const ids = ["p1", "p2"];
      mockRepository.bulkSetStatusByReservation.mockResolvedValue({ count: 2 });

      const result = await service.bulkSetStatusByReservation(
        mockCtx,
        ids,
        "JOINED" as any,
        "ATTENDED" as any,
        mockTx,
      );

      expect(mockRepository.bulkSetStatusByReservation).toHaveBeenCalledWith(
        mockCtx,
        ids,
        "JOINED",
        "ATTENDED",
        mockTx,
      );
      expect(result).toEqual({ count: 2 });
    });
  });

  describe("bulkCancelParticipationsByOpportunitySlot", () => {
    it("should bulk cancel participations", async () => {
      const ids = ["p1", "p2"];
      mockRepository.bulkSetStatusByReservation.mockResolvedValue({ count: 2 });

      const result = await service.bulkCancelParticipationsByOpportunitySlot(mockCtx, ids, mockTx);

      expect(mockRepository.bulkSetStatusByReservation).toHaveBeenCalledWith(
        mockCtx,
        ids,
        "NOT_PARTICIPATING",
        "OPPORTUNITY_CANCELED",
        mockTx,
      );
      expect(result).toEqual({ count: 2 });
    });
  });

  describe("validateDeletable", () => {
    it("should pass if participation is personal record", () => {
      const participation = { reason: "PERSONAL_RECORD" } as any;

      expect(() => {
        service.validateDeletable(participation);
      }).not.toThrow();
    });

    it("should throw ValidationError if participation is not personal record", () => {
      const participation = { reason: "ATTENDED" } as any;

      expect(() => {
        service.validateDeletable(participation);
      }).toThrow(ValidationError);
    });
  });
});
