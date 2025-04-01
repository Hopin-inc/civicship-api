import EvaluationService from "@/application/domain/evaluation/service";
import { ValidationError } from "@/errors/graphql";
import { PrismaEvaluation } from "@/application/domain/evaluation/data/type";
import { GqlEvaluationCreateInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { EvaluationStatus, Prisma } from "@prisma/client";
import { getCurrentUserId } from "@/application/domain/utils";
import EvaluationConverter from "@/application/domain/evaluation/data/converter";
import EvaluationRepository from "@/application/domain/evaluation/data/repository";

jest.mock("@/application/domain/evaluation/data/converter");
jest.mock("@/application/domain/evaluation/data/repository");
jest.mock("@/application/domain/utils");

describe("EvaluationService", () => {
  const ctx = {} as IContext;
  const tx = {} as Prisma.TransactionClient;
  const evaluatorId = "user-123";
  const input: GqlEvaluationCreateInput = {
    participationId: "p1",
    comment: "Looks good!",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUserId as jest.Mock).mockReturnValue(evaluatorId);
  });

  describe("createEvaluation", () => {
    it("should create a PASSED evaluation", async () => {
      const status = EvaluationStatus.PASSED;
      const prismaInput = { dummy: true } as any;
      const mockResult = { id: "eval-1" };

      (EvaluationConverter.create as jest.Mock).mockReturnValue(prismaInput);
      (EvaluationRepository.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await EvaluationService.createEvaluation(ctx, input, status, tx);

      expect(getCurrentUserId).toHaveBeenCalledWith(ctx);
      expect(EvaluationConverter.create).toHaveBeenCalledWith(
        input.participationId,
        evaluatorId,
        status,
        input.comment,
      );
      expect(EvaluationRepository.create).toHaveBeenCalledWith(ctx, prismaInput, tx);
      expect(result).toBe(mockResult);
    });

    it("should throw ValidationError for invalid status", async () => {
      const invalidStatus = EvaluationStatus.PENDING;

      await expect(
        EvaluationService.createEvaluation(ctx, input, invalidStatus, tx),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("validateParticipationHasOpportunity", () => {
    const evaluationId = "eval-1";

    it("should return participation, opportunity, and communityId if all are present", () => {
      const evaluation: PrismaEvaluation = {
        id: evaluationId,
        participation: {
          id: "p1",
          communityId: "c1",
          opportunitySlot: {
            opportunity: { id: "o1" },
          },
        },
      } as any;

      const result = EvaluationService.validateParticipationHasOpportunity(evaluation);

      expect(result.participation.id).toBe("p1");
      expect(result.opportunity.id).toBe("o1");
      expect(result.communityId).toBe("c1");
    });

    it("should throw if participation is missing", () => {
      const evaluation: PrismaEvaluation = {
        id: evaluationId,
        participation: undefined,
      } as any;

      expect(() => EvaluationService.validateParticipationHasOpportunity(evaluation)).toThrow(
        ValidationError,
      );
    });

    it("should throw if opportunity is missing", () => {
      const evaluation: PrismaEvaluation = {
        id: evaluationId,
        participation: {
          id: "p1",
          communityId: "c1",
          opportunitySlot: {
            opportunity: undefined,
          },
        },
      } as any;

      expect(() => EvaluationService.validateParticipationHasOpportunity(evaluation)).toThrow(
        ValidationError,
      );
    });

    it("should throw if communityId is missing", () => {
      const evaluation: PrismaEvaluation = {
        id: evaluationId,
        participation: {
          id: "p1",
          communityId: null,
          opportunitySlot: {
            opportunity: { id: "o1" },
          },
        },
      } as any;

      expect(() => EvaluationService.validateParticipationHasOpportunity(evaluation)).toThrow(
        ValidationError,
      );
    });
  });
});
