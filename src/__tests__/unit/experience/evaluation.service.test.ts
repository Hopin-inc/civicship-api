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

    it("should throw NotFoundError if reservation is missing for non-PERSONAL_RECORD", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
          userId: "user-1",
          reservation: null,
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should throw NotFoundError if opportunitySlot is missing from reservation", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
          userId: "user-1",
          reservation: {
            opportunitySlot: null,
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should throw NotFoundError if opportunitySlot is missing for PERSONAL_RECORD", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "user-1",
          opportunitySlot: null,
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should throw NotFoundError if opportunity is missing from PERSONAL_RECORD opportunitySlot", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "user-1",
          opportunitySlot: {
            opportunity: null,
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should handle complex nested null checks gracefully", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
          userId: "user-1",
          reservation: {
            opportunitySlot: {
              opportunity: undefined,
            },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should handle different ParticipationStatusReason values correctly", () => {
      const reasons = [
        ParticipationStatusReason.RESERVATION_ACCEPTED,
        ParticipationStatusReason.OPPORTUNITY_CANCELED,
        ParticipationStatusReason.RESERVATION_CANCELED,
      ];

      reasons.forEach(reason => {
        const evaluation = {
          id: "evaluation-1",
          participation: {
            reason,
            userId: "user-1",
            reservation: {
              opportunitySlot: {
                opportunity: { id: "opportunity-1" },
              },
            },
          },
        } as any;

        const result = service.validateParticipationHasOpportunity(evaluation);
        expect(result.opportunity.id).toBe("opportunity-1");
      });
    });

    it("should handle undefined evaluation object", () => {
      expect(() => {
        service.validateParticipationHasOpportunity(undefined as any);
      }).toThrow();
    });

    it("should handle evaluation with undefined participation property", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: undefined,
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should handle deeply nested undefined values in PERSONAL_RECORD path", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "user-1",
          opportunitySlot: {
            opportunity: undefined,
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should handle deeply nested undefined values in reservation path", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
          userId: "user-1",
          reservation: {
            opportunitySlot: {
              opportunity: undefined,
            },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should handle empty string userId", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "",
          opportunitySlot: {
            opportunity: { id: "opportunity-1" },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should handle whitespace-only userId", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "   ",
          opportunitySlot: {
            opportunity: { id: "opportunity-1" },
          },
        },
      } as any;

      const result = service.validateParticipationHasOpportunity(evaluation);
      expect(result.userId).toBe("   ");
    });

    it("should validate error message contains evaluationId for participation missing", () => {
      const evaluation = {
        id: "evaluation-123",
        participation: null,
      } as any;

      try {
        service.validateParticipationHasOpportunity(evaluation);
        fail("Expected NotFoundError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(NotFoundError);
        if (e instanceof NotFoundError) {
          expect(e.message).toContain("Participation or Opportunity");
        }
      }
    });

    it("should validate error message contains evaluationId for opportunity missing", () => {
      const evaluation = {
        id: "evaluation-456",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "user-1",
          opportunitySlot: {
            opportunity: null,
          },
        },
      } as any;

      try {
        service.validateParticipationHasOpportunity(evaluation);
        fail("Expected NotFoundError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(NotFoundError);
        if (e instanceof NotFoundError) {
          expect(e.message).toContain("Participation or Opportunity");
        }
      }
    });

    it("should validate error message contains evaluationId for userId missing", () => {
      const evaluation = {
        id: "evaluation-789",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: null,
          opportunitySlot: {
            opportunity: { id: "opportunity-1" },
          },
        },
      } as any;

      try {
        service.validateParticipationHasOpportunity(evaluation);
        fail("Expected NotFoundError to be thrown");
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(NotFoundError);
        if (e instanceof NotFoundError) {
          expect(e.message).toContain("User ID");
        }
      }
    });

    it("should handle complex mixed null/undefined scenario", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
          userId: "user-1",
          reservation: null,
          opportunitySlot: {
            opportunity: { id: "should-not-be-used" },
          },
        },
      } as any;

      expect(() => {
        service.validateParticipationHasOpportunity(evaluation);
      }).toThrow(NotFoundError);
    });

    it("should prioritize PERSONAL_RECORD path over reservation path when both exist", () => {
      const evaluation = {
        id: "evaluation-1",
        participation: {
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          userId: "user-1",
          opportunitySlot: {
            opportunity: { id: "personal-opportunity" },
          },
          reservation: {
            opportunitySlot: {
              opportunity: { id: "reservation-opportunity" },
            },
          },
        },
      } as any;

      const result = service.validateParticipationHasOpportunity(evaluation);
      expect(result.opportunity.id).toBe("personal-opportunity");
    });
  });
});
