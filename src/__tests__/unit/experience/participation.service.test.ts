import { IContext } from "@/types/server";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import { GqlParticipationCreatePersonalRecordInput } from "@/types/graphql";
import ParticipationConverter from "@/application/domain/experience/participation/data/converter";
import ParticipationRepository from "@/application/domain/experience/participation/data/repository";
import ParticipationService from "@/application/domain/experience/participation/service";
import { getCurrentUserId } from "@/application/domain/utils";
import { PrismaParticipation } from "@/application/domain/experience/participation/data/type";
import { ValidationError } from "@/errors/graphql";

jest.mock("@/application/domain/experience/participation/data/converter");
jest.mock("@/application/domain/experience/participation/data/repository");
jest.mock("@/application/domain/utils");

describe("ParticipationService", () => {
  let ctx: IContext;
  const tx = {} as Prisma.TransactionClient;
  const currentUserId = "user-123";

  beforeEach(() => {
    ctx = { currentUser: { id: currentUserId } } as IContext;
    jest.clearAllMocks();
  });

  describe("createParticipation", () => {
    const input: GqlParticipationCreatePersonalRecordInput = {
      description: "test record",
      images: [],
    };

    const prismaInput: Prisma.ParticipationCreateInput = {
      status: ParticipationStatus.PARTICIPATED,
      reason: ParticipationStatusReason.PERSONAL_RECORD,
      description: input.description,
      user: { connect: { id: currentUserId } },
      statusHistories: {
        create: {
          status: ParticipationStatus.PARTICIPATED,
          reason: ParticipationStatusReason.PERSONAL_RECORD,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
      images: { create: [] }, // ✅ ここに含めてしまえばOK！
    };

    it("should create a personal participation", async () => {
      const mockResult = { id: "1" };

      (ParticipationConverter.create as jest.Mock).mockReturnValue({
        data: prismaInput,
        images: [],
      });

      (ParticipationRepository.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await ParticipationService.createParticipation(ctx, input, currentUserId);

      expect(ParticipationConverter.create).toHaveBeenCalledWith(input, currentUserId);
      expect(ParticipationRepository.create).toHaveBeenCalledWith(ctx, prismaInput);
      expect(result).toBe(mockResult);
    });
  });

  describe("setStatus", () => {
    const id = "participation-1";
    const status = ParticipationStatus.NOT_PARTICIPATING;
    const reason = ParticipationStatusReason.RESERVATION_CANCELED;

    const prismaInput: Prisma.ParticipationUpdateInput = {
      status,
      reason,
      statusHistories: {
        create: {
          status,
          reason,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };

    it("should call setStatus with currentUserId", async () => {
      (ParticipationConverter.setStatus as jest.Mock).mockReturnValue(prismaInput);
      (ParticipationRepository.setStatus as jest.Mock).mockResolvedValue("updated");

      const result = await ParticipationService.setStatus(
        ctx,
        id,
        status,
        reason,
        currentUserId,
        tx,
      );

      expect(ParticipationConverter.setStatus).toHaveBeenCalledWith(currentUserId, status, reason);
      expect(ParticipationRepository.setStatus).toHaveBeenCalledWith(ctx, id, prismaInput, tx);
      expect(result).toBe("updated");
    });

    it("should fallback to getCurrentUserId if not provided", async () => {
      (getCurrentUserId as jest.Mock).mockReturnValue(currentUserId);
      (ParticipationConverter.setStatus as jest.Mock).mockReturnValue(prismaInput);
      (ParticipationRepository.setStatus as jest.Mock).mockResolvedValue("updated");

      const result = await ParticipationService.setStatus(ctx, id, status, reason, undefined, tx);

      expect(getCurrentUserId).toHaveBeenCalledWith(ctx);
      expect(result).toBe("updated");
    });
  });

  describe("bulkSetStatusByReservation", () => {
    const ids = ["p1", "p2"];
    const status = ParticipationStatus.PARTICIPATING;
    const reason = ParticipationStatusReason.RESERVATION_ACCEPTED;

    it("should call repository with correct args", async () => {
      const mockResult = { count: 2 };
      (ParticipationRepository.bulkSetParticipationStatus as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await ParticipationService.bulkSetStatusByReservation(
        ctx,
        ids,
        status,
        reason,
        tx,
      );

      expect(ParticipationRepository.bulkSetParticipationStatus).toHaveBeenCalledWith(
        ctx,
        ids,
        { status, reason },
        tx,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("bulkCancelParticipationsByOpportunity", () => {
    const ids = ["p3", "p4"];

    it("should cancel participations with fixed status/reason", async () => {
      const mockResult = { count: 2 };
      (ParticipationRepository.bulkSetParticipationStatus as jest.Mock).mockResolvedValue(
        mockResult,
      );

      const result = await ParticipationService.bulkCancelParticipationsByOpportunitySlot(
        ctx,
        ids,
        tx,
      );

      expect(ParticipationRepository.bulkSetParticipationStatus).toHaveBeenCalledWith(
        ctx,
        ids,
        {
          status: ParticipationStatus.NOT_PARTICIPATING,
          reason: ParticipationStatusReason.OPPORTUNITY_CANCELED,
        },
        tx,
      );
      expect(result).toBe(mockResult);
    });
  });

  describe("validateDeletable", () => {
    it("should throw ValidationError if reason is not PERSONAL_RECORD", () => {
      const invalid: PrismaParticipation = {
        id: "1",
        reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
      } as any;

      expect(() => ParticipationService.validateDeletable(invalid)).toThrow(ValidationError);
    });

    it("should pass if reason is PERSONAL_RECORD", () => {
      const valid: PrismaParticipation = {
        id: "2",
        reason: ParticipationStatusReason.PERSONAL_RECORD,
      } as any;

      expect(() => ParticipationService.validateDeletable(valid)).not.toThrow();
    });
  });
});
