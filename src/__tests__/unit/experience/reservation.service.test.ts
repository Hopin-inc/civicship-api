import "reflect-metadata";
import { container } from "tsyringe";
import ReservationService from "@/application/domain/experience/reservation/service";
import {
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
  ReservationStatus,
} from "@prisma/client";
import { IContext } from "@/types/server";
import { ReservationStatuses } from "@/application/domain/experience/reservation/helper";

class MockReservationRepository {
  query = jest.fn();
  checkConflict = jest.fn();
  find = jest.fn();
  create = jest.fn();
  setStatus = jest.fn();
}

class MockReservationConverter {
  filter = jest.fn();
  sort = jest.fn();
  checkConflict = jest.fn();
  create = jest.fn();
  setStatus = jest.fn();
}

describe("ReservationService", () => {
  let service: ReservationService;
  let mockRepository: MockReservationRepository;
  let mockConverter: MockReservationConverter;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockReservationRepository();
    mockConverter = new MockReservationConverter();

    container.register("ReservationRepository", { useValue: mockRepository });
    container.register("ReservationConverter", { useValue: mockConverter });

    service = container.resolve(ReservationService);
  });

  describe("createReservation", () => {
    it("should create a reservation with converted data", async () => {
      const communityId = "community-1";
      const opportunitySlotId = "slot-1";
      const participantCount = 3;
      const userIdsIfExists = ["user-2", "user-3"];
      const reservationStatuses = {
        reservationStatus: ReservationStatus.APPLIED,
        participationStatus: ParticipationStatus.PARTICIPATING,
        participationStatusReason: ParticipationStatusReason.RESERVATION_APPLIED,
      } as ReservationStatuses;

      const createdData = { opportunitySlotId: "slot-1", userId: "test-user-id" };
      mockConverter.create.mockReturnValue(createdData);
      mockRepository.create.mockResolvedValue({ id: "reservation-1" });

      const result = await service.createReservation(
        mockCtx,
        opportunitySlotId,
        participantCount,
        userIdsIfExists,
        reservationStatuses,
        mockTx,
        undefined,
        communityId,
      );

      expect(mockConverter.create).toHaveBeenCalledWith(
        opportunitySlotId,
        "test-user-id",
        participantCount,
        userIdsIfExists,
        reservationStatuses,
        undefined,
        communityId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, createdData, mockTx);
      expect(result).toEqual({ id: "reservation-1" });
    });
  });

  describe("setStatus", () => {
    it("should set status for a reservation", async () => {
      const id = "reservation-1";
      const status = ReservationStatus.ACCEPTED;
      const currentUserId = "test-user-id";

      const updatedData = { status: ReservationStatus.ACCEPTED };
      mockConverter.setStatus.mockReturnValue(updatedData);
      mockRepository.setStatus.mockResolvedValue({
        id: "reservation-1",
        status: ReservationStatus.ACCEPTED,
      });

      const result = await service.setStatus(mockCtx, id, currentUserId, status, mockTx);

      expect(mockConverter.setStatus).toHaveBeenCalledWith(currentUserId, status);
      expect(mockRepository.setStatus).toHaveBeenCalledWith(mockCtx, id, updatedData, mockTx);
      expect(result).toEqual({ id: "reservation-1", status: ReservationStatus.ACCEPTED });
    });
  });
});
