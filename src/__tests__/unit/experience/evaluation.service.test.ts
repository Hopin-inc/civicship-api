import "reflect-metadata";
import { container } from "tsyringe";
import EvaluationService from "@/application/domain/experience/evaluation/service";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { EvaluationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlEvaluationCreateInput } from "@/types/graphql";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";

class MockEvaluationRepository {
  query = jest.fn();
  find = jest.fn();
  create = jest.fn();
}

class MockEvaluationConverter {
  filter = jest.fn();
  sort = jest.fn();
  create = jest.fn();
}

class MockUtils {
  getCurrentUserId = jest.fn();
}

describe("EvaluationService", () => {
  let service: EvaluationService;
  let mockRepository: MockEvaluationRepository;
  let mockConverter: MockEvaluationConverter;
  let mockUtils: MockUtils;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockEvaluationRepository();
    mockConverter = new MockEvaluationConverter();
    mockUtils = new MockUtils();
    mockUtils.getCurrentUserId = jest.fn().mockReturnValue("test-user-id");

    container.register("EvaluationRepository", { useValue: mockRepository });
    container.register("EvaluationConverter", { useValue: mockConverter });

    service = container.resolve(EvaluationService);
  });

  describe("createEvaluation", () => {
    it("should create evaluation if status is PASSED or FAILED", async () => {
      const input = {
        participationId: "participation-1",
        comment: "Great job!",
      } as GqlEvaluationCreateInput;

      const status = EvaluationStatus.PASSED;
      const converted = { participationId: "participation-1", userId: "test-user-id" };
      const currentUserId = mockUtils.getCurrentUserId(mockCtx);

      mockConverter.create.mockReturnValue(converted);
      mockRepository.create.mockResolvedValue({ id: "evaluation-1" });

      const result = await service.createEvaluation(mockCtx, currentUserId, input, status, mockTx);

      expect(mockConverter.create).toHaveBeenCalledWith(
        input.participationId,
        "test-user-id",
        status,
        input.comment,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, converted, mockTx);
      expect(result).toEqual({ id: "evaluation-1" });
    });

    it("should throw ValidationError if status is not PASSED or FAILED", async () => {
      const input = { participationId: "p1", comment: "ok" } as GqlEvaluationCreateInput;
      const invalidStatus = EvaluationStatus.PENDING;
      const currentUserId = mockUtils.getCurrentUserId(mockCtx);

      await expect(
        service.createEvaluation(mockCtx, currentUserId, input, invalidStatus, mockTx),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("validateParticipationHasOpportunity", () => {
    it("should return participation, opportunity, and userId if all exist", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          id: "participation-1",
          userId: "user-1",
          reservation: {
            opportunitySlot: {
              opportunity: { id: "opportunity-1" },
            },
          },
        },
      } as PrismaEvaluation;

      const result = service.validateParticipationHasOpportunity(evaluation);

      expect(result.participation.id).toBe("participation-1");
      expect(result.opportunity.id).toBe("opportunity-1");
      expect(result.userId).toBe("user-1");
    });

    it("should throw NotFoundError if participation is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: null,
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should throw NotFoundError if opportunity is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          userId: "user-1",
          reservation: {
            opportunitySlot: { opportunity: null },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should throw NotFoundError if userId is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          userId: null,
          reservation: {
            opportunitySlot: {
              opportunity: { id: "opportunity-1" },
            },
          },
        },
      } as PrismaEvaluation;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should use opportunitySlot from participation if reason is PERSONAL_RECORD", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "user-1",
          opportunitySlot: {
            opportunity: { id: "opportunity-2" },
          },
        },
      } as any;

      const result = service.validateParticipationHasOpportunity(evaluation);
      expect(result.opportunity.id).toBe("opportunity-2");
    });
  });
});
