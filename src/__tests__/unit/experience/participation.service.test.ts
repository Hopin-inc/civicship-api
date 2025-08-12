import "reflect-metadata";
import { container } from "tsyringe";
import ParticipationService from "@/application/domain/experience/participation/service";
import { NotFoundError, PersonalRecordOnlyDeletableError } from "@/errors/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlParticipationCreatePersonalRecordInput } from "@/types/graphql";
import { PrismaParticipationDetail } from "@/application/domain/experience/participation/data/type";
import { MOCK_IMAGE_UPLOAD_RESULT } from "@/__tests__/helper/mock-helper";

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
  uploadPublicImage = jest.fn().mockResolvedValue(MOCK_IMAGE_UPLOAD_RESULT);
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
      const input = { title: "My Participation" } as GqlParticipationCreatePersonalRecordInput;
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
      const status = ParticipationStatus.PARTICIPATED;
      const reason = ParticipationStatusReason.RESERVATION_ACCEPTED;
      const updatedData = {
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
      };

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
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        mockTx,
      );

      expect(mockRepository.bulkSetStatusByReservation).toHaveBeenCalledWith(
        mockCtx,
        ids,
        ParticipationStatus.PARTICIPATING,
        ParticipationStatusReason.RESERVATION_ACCEPTED,
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
      const participation = {
        reason: ParticipationStatusReason.PERSONAL_RECORD,
      } as PrismaParticipationDetail;

      expect(() => {
        service.validateDeletable(participation);
      }).not.toThrow();
    });

    it("should throw ValidationError if participation is not personal record", () => {
      const participation = {
        reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
      } as PrismaParticipationDetail;

      expect(() => {
        service.validateDeletable(participation);
      }).toThrow(PersonalRecordOnlyDeletableError);
    });

    it("should test all non-PERSONAL_RECORD reasons", () => {
      const nonPersonalRecordReasons = [
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        ParticipationStatusReason.OPPORTUNITY_CANCELED,
        ParticipationStatusReason.RESERVATION_CANCELED,
      ];

      nonPersonalRecordReasons.forEach(reason => {
        const participation = { reason } as PrismaParticipationDetail;
        
        expect(() => {
          service.validateDeletable(participation);
        }).toThrow(PersonalRecordOnlyDeletableError);
      });
    });

    it("should handle null/undefined reason gracefully", () => {
      const participationWithNullReason = { reason: null } as any;
      const participationWithUndefinedReason = { reason: undefined } as any;

      expect(() => {
        service.validateDeletable(participationWithNullReason);
      }).toThrow(PersonalRecordOnlyDeletableError);

      expect(() => {
        service.validateDeletable(participationWithUndefinedReason);
      }).toThrow(PersonalRecordOnlyDeletableError);
    });

    it("should handle edge case with empty participation object", () => {
      const emptyParticipation = {} as any;

      expect(() => {
        service.validateDeletable(emptyParticipation);
      }).toThrow(PersonalRecordOnlyDeletableError);
    });

    it("should test all non-PERSONAL_RECORD reasons", () => {
      const nonPersonalRecordReasons = [
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        ParticipationStatusReason.OPPORTUNITY_CANCELED,
        ParticipationStatusReason.RESERVATION_CANCELED,
      ];

      nonPersonalRecordReasons.forEach(reason => {
        const participation = { reason } as PrismaParticipationDetail;
        
        expect(() => {
          service.validateDeletable(participation);
        }).toThrow(PersonalRecordOnlyDeletableError);
      });
    });

    it("should handle null/undefined reason gracefully", () => {
      const participationWithNullReason = { reason: null } as any;
      const participationWithUndefinedReason = { reason: undefined } as any;

      expect(() => {
        service.validateDeletable(participationWithNullReason);
      }).toThrow(PersonalRecordOnlyDeletableError);

      expect(() => {
        service.validateDeletable(participationWithUndefinedReason);
      }).toThrow(PersonalRecordOnlyDeletableError);
    });

    it("should handle edge case with empty participation object", () => {
      const emptyParticipation = {} as any;

      expect(() => {
        service.validateDeletable(emptyParticipation);
      }).toThrow(PersonalRecordOnlyDeletableError);
    });
  });
});
