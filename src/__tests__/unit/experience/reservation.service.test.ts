import "reflect-metadata";
import { container } from "tsyringe";
import ReservationService from "@/application/domain/experience/reservation/service";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

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
      const opportunitySlotId = "slot-1";
      const participantCount = 3;
      const userIdsIfExists = ["user-2", "user-3"];
      const reservationStatuses = {
        participant: "JOINED",
        inviter: "CREATED",
      } as any;

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
      );

      expect(mockConverter.create).toHaveBeenCalledWith(
        opportunitySlotId,
        "test-user-id",
        participantCount,
        userIdsIfExists,
        reservationStatuses,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, createdData, mockTx);
      expect(result).toEqual({ id: "reservation-1" });
    });
  });

  describe("setStatus", () => {
    it("should set status for a reservation", async () => {
      const id = "reservation-1";
      const status = "APPROVED" as any;
      const currentUserId = "test-user-id";

      const updatedData = { status: "APPROVED" };
      mockConverter.setStatus.mockReturnValue(updatedData);
      mockRepository.setStatus.mockResolvedValue({ id: "reservation-1", status: "APPROVED" });

      const result = await service.setStatus(mockCtx, id, currentUserId, status, mockTx);

      expect(mockConverter.setStatus).toHaveBeenCalledWith(currentUserId, status);
      expect(mockRepository.setStatus).toHaveBeenCalledWith(mockCtx, id, updatedData, mockTx);
      expect(result).toEqual({ id: "reservation-1", status: "APPROVED" });
    });
  });
});
