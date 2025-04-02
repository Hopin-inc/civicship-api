import ReservationService from "@/application/domain/reservation/service";
import ReservationConverter from "@/application/domain/reservation/data/converter";
import ReservationRepository from "@/application/domain/reservation/data/repository";
import { getCurrentUserId } from "@/application/domain/utils";
import { ReservationStatus } from "@prisma/client";
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
