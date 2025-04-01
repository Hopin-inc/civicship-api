import ReservationService from "@/application/domain/reservation/service";
import ReservationConverter from "@/application/domain/reservation/data/converter";
import ReservationRepository from "@/application/domain/reservation/data/repository";
import { getCurrentUserId } from "@/application/domain/utils";
import { ValidationError } from "@/errors/graphql";
import { OpportunityCategory, ReservationStatus } from "@prisma/client";
import { IContext } from "@/types/server";

jest.mock("@/application/domain/reservation/data/converter");
jest.mock("@/application/domain/reservation/data/repository");
jest.mock("@/application/domain/utils");

describe("ReservationService (non-fetch/find methods)", () => {
  const ctx = {} as IContext;
  const tx = {} as any;
  const userId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUserId as jest.Mock).mockReturnValue(userId);
  });

  describe("countUserReservationsByCategory", () => {
    it("should call repository.count with correct where input", async () => {
      const category = OpportunityCategory.EVENT;
      const whereInput = { dummy: true };
      const mockResult = 5;

      (ReservationConverter.countByUserAndOpportunityCategory as jest.Mock).mockReturnValue(
        whereInput,
      );
      (ReservationRepository.count as jest.Mock).mockResolvedValue(mockResult);

      const result = await ReservationService.countUserReservationsByCategory(
        ctx,
        userId,
        category,
        tx,
      );

      expect(ReservationConverter.countByUserAndOpportunityCategory).toHaveBeenCalledWith(
        userId,
        category,
      );
      expect(ReservationRepository.count).toHaveBeenCalledWith(ctx, whereInput, tx);
      expect(result).toBe(mockResult);
    });
  });

  describe("checkConflictBeforeReservation", () => {
    const slotStartsAt = new Date("2025-04-01T10:00:00.000Z");
    const slotEndsAt = new Date("2025-04-01T11:00:00.000Z");

    it("should pass if no conflicts are found", async () => {
      (ReservationConverter.checkConflict as jest.Mock).mockReturnValue({ dummy: true });
      (ReservationRepository.checkConflict as jest.Mock).mockResolvedValue([]);

      await expect(
        ReservationService.checkConflictBeforeReservation(ctx, userId, slotStartsAt, slotEndsAt),
      ).resolves.not.toThrow();

      expect(ReservationConverter.checkConflict).toHaveBeenCalledWith(
        userId,
        slotStartsAt,
        slotEndsAt,
      );
    });

    it("should throw ValidationError if conflicts exist", async () => {
      (ReservationConverter.checkConflict as jest.Mock).mockReturnValue({ dummy: true });
      (ReservationRepository.checkConflict as jest.Mock).mockResolvedValue([{ id: "conflict-1" }]);

      await expect(
        ReservationService.checkConflictBeforeReservation(ctx, userId, slotStartsAt, slotEndsAt),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("setStatus", () => {
    const reservationId = "rsv-123";
    const status = ReservationStatus.APPLIED;
    const data = { status };

    it("should call converter and repository with correct args", async () => {
      (ReservationConverter.setStatus as jest.Mock).mockReturnValue(data);
      (ReservationRepository.setStatus as jest.Mock).mockResolvedValue({ id: reservationId });

      const result = await ReservationService.setStatus(ctx, reservationId, userId, status, tx);

      expect(ReservationConverter.setStatus).toHaveBeenCalledWith(userId, status);
      expect(ReservationRepository.setStatus).toHaveBeenCalledWith(ctx, reservationId, data, tx);
      expect(result).toEqual({ id: reservationId });
    });
  });
});
