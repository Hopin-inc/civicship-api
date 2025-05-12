import "reflect-metadata";
import { container } from "tsyringe";
import EvaluationService from "@/application/domain/experience/evaluation/service";
import { ValidationError } from "@/errors/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

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

describe("EvaluationService", () => {
  let service: EvaluationService;
  let mockRepository: MockEvaluationRepository;
  let mockConverter: MockEvaluationConverter;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockEvaluationRepository();
    mockConverter = new MockEvaluationConverter();

    container.register("EvaluationRepository", { useValue: mockRepository });
    container.register("EvaluationConverter", { useValue: mockConverter });

    service = container.resolve(EvaluationService);
  });

  describe("createEvaluation", () => {
    it("should create evaluation if status is PASSED or FAILED", async () => {
      const input = {
        participationId: "participation-1",
        comment: "Great job!",
      } as any;

      const status = "PASSED" as any;
      const converted = { participationId: "participation-1", userId: "test-user-id" };

      mockConverter.create.mockReturnValue(converted);
      mockRepository.create.mockResolvedValue({ id: "evaluation-1" });

      const result = await service.createEvaluation(mockCtx, input, status, mockTx);

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
      const input = { participationId: "p1", comment: "ok" } as any;
      const invalidStatus = "REVIEWING" as any; // 不正なステータス

      await expect(service.createEvaluation(mockCtx, input, invalidStatus, mockTx)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("validateParticipationHasOpportunity", () => {
    it("should return participation, opportunity, communityId, userId if all exist", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          id: "participation-1",
          communityId: "community-1",
          userId: "user-1",
          reservation: {
            opportunitySlot: {
              opportunity: { id: "opportunity-1" },
            },
          },
        },
      } as any;

      const result = service.validateParticipationHasOpportunity(evaluation);

      expect(result.participation.id).toBe("participation-1");
      expect(result.opportunity.id).toBe("opportunity-1");
      expect(result.communityId).toBe("community-1");
      expect(result.userId).toBe("user-1");
    });

    it("should throw ValidationError if participation is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: null,
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if opportunity is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          id: "p1",
          communityId: "community-1",
          userId: "user-1",
          reservation: {
            opportunitySlot: { opportunity: null },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if communityId is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          id: "p1",
          communityId: null,
          userId: "user-1",
          reservation: {
            opportunitySlot: {
              opportunity: { id: "opportunity-1" },
            },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(ValidationError);
    });

    it("should throw ValidationError if userId is missing", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          id: "p1",
          communityId: "community-1",
          userId: null,
          reservation: {
            opportunitySlot: {
              opportunity: { id: "opportunity-1" },
            },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(ValidationError);
    });
  });
});
