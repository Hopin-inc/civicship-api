import ReservationService from "@/application/domain/experience/reservation/service";
import ReservationConverter from "@/application/domain/experience/reservation/data/converter";
import ReservationRepository from "@/application/domain/experience/reservation/data/repository";
import { getCurrentUserId } from "@/application/domain/utils";
import {
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
  ReservationStatus,
} from "@prisma/client";
import { IContext } from "@/types/server";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";

jest.mock("@/application/domain/experience/reservation/data/converter");
jest.mock("@/application/domain/experience/reservation/data/repository");
jest.mock("@/application/domain/utils");

describe("ReservationService", () => {
  const ctx = {} as IContext;
  const tx = {} as Prisma.TransactionClient;
  const userId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUserId as jest.Mock).mockReturnValue(userId);
  });

  describe("createReservation", () => {
    const opportunitySlotId = "slot-123";
    const participantCount = 3;
    const userIdsIfExists = ["user-456", "user-789"];
    const reservationStatuses: ReservationStatuses = {
      reservationStatus: ReservationStatus.APPLIED,
      participationStatus: ParticipationStatus.PARTICIPATING,
      participationStatusReason: ParticipationStatusReason.RESERVATION_APPLIED,
    };
    const mockConverted = { opportunitySlotId, participantCount };

    it("should call converter and repository with correct arguments", async () => {
      (ReservationConverter.create as jest.Mock).mockReturnValue(mockConverted);
      (ReservationRepository.create as jest.Mock).mockResolvedValue({ id: "rsv-001" });

      const result = await ReservationService.createReservation(
        ctx,
        opportunitySlotId,
        participantCount,
        userIdsIfExists,
        reservationStatuses,
        tx,
      );

      expect(ReservationConverter.create).toHaveBeenCalledWith(
        opportunitySlotId,
        userId,
        participantCount,
        userIdsIfExists,
        reservationStatuses,
      );
      expect(ReservationRepository.create).toHaveBeenCalledWith(ctx, mockConverted, tx);
      expect(result).toEqual({ id: "rsv-001" });
    });

    it("should throw if converter throws", async () => {
      (ReservationConverter.create as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid input");
      });

      await expect(
        ReservationService.createReservation(
          ctx,
          opportunitySlotId,
          participantCount,
          userIdsIfExists,
          reservationStatuses,
          tx,
        ),
      ).rejects.toThrow("Invalid input");
    });

    it("should throw if repository throws", async () => {
      (ReservationConverter.create as jest.Mock).mockReturnValue(mockConverted);
      (ReservationRepository.create as jest.Mock).mockRejectedValue(new Error("DB failure"));

      await expect(
        ReservationService.createReservation(
          ctx,
          opportunitySlotId,
          participantCount,
          userIdsIfExists,
          reservationStatuses,
          tx,
        ),
      ).rejects.toThrow("DB failure");
    });
  });

  describe("setStatus", () => {
    const reservationId = "rsv-123";
    const status = ReservationStatus.APPLIED;
    const data = { status };

    it("should call converter and repository with correct arguments", async () => {
      (ReservationConverter.setStatus as jest.Mock).mockReturnValue(data);
      (ReservationRepository.setStatus as jest.Mock).mockResolvedValue({ id: reservationId });

      const result = await ReservationService.setStatus(ctx, reservationId, userId, status, tx);

      expect(ReservationConverter.setStatus).toHaveBeenCalledWith(userId, status);
      expect(ReservationRepository.setStatus).toHaveBeenCalledWith(ctx, reservationId, data, tx);
      expect(result).toEqual({ id: reservationId });
    });

    it("should throw if repository throws", async () => {
      (ReservationConverter.setStatus as jest.Mock).mockReturnValue(data);
      (ReservationRepository.setStatus as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(
        ReservationService.setStatus(ctx, reservationId, userId, status, tx),
      ).rejects.toThrow("DB error");
    });
  });
});
