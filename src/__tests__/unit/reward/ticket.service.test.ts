import "reflect-metadata";
import { container } from "tsyringe";
import TicketService from "@/application/domain/reward/ticket/service";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { NotFoundError, ValidationError } from "@/errors/graphql";

class MockTicketRepository {
  create = jest.fn();
  update = jest.fn();
  find = jest.fn();
}

class MockTicketConverter {
  claim = jest.fn();
  reserve = jest.fn();
  cancelReserved = jest.fn();
  refund = jest.fn();
  purchase = jest.fn();
  use = jest.fn();
}

describe("TicketService", () => {
  let service: TicketService;
  let mockRepository: MockTicketRepository;
  let mockConverter: MockTicketConverter;
  const mockCtx = {
    currentUser: { id: "test-user-id" },
  } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockTicketRepository();
    mockConverter = new MockTicketConverter();

    container.register("TicketRepository", { useValue: mockRepository });
    container.register("TicketConverter", { useValue: mockConverter });

    service = container.resolve(TicketService);
  });

  describe("claimTicketsByIssuerId", () => {
    it("should create multiple tickets", async () => {
      const issuedTicket = { qtyToBeIssued: 3 } as any;
      mockConverter.claim.mockReturnValue({ created: true });
      mockRepository.create.mockResolvedValue({ id: "ticket" });

      const result = await service.claimTicketsByIssuerId(
        mockCtx,
        "user-id",
        "claim-link-id",
        issuedTicket,
        "wallet-id",
        mockTx,
      );

      expect(mockConverter.claim).toHaveBeenCalledTimes(3);
      expect(mockRepository.create).toHaveBeenCalledTimes(3);
      expect(result.length).toBe(3);
    });
  });

  describe("reserveManyTickets", () => {
    it("should throw ValidationError if ticketIds not provided", async () => {
      await expect(service.reserveManyTickets(mockCtx, ["pid1"], mockTx)).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw ValidationError if ticketIds and participationIds mismatch", async () => {
      await expect(
        service.reserveManyTickets(mockCtx, ["pid1", "pid2"], mockTx, ["tid1"]),
      ).rejects.toThrow(ValidationError);
    });

    it("should reserve tickets properly", async () => {
      mockConverter.reserve.mockReturnValue({ reserved: true });
      mockRepository.update.mockResolvedValue({ id: "ticket" });

      await service.reserveManyTickets(mockCtx, ["pid1"], mockTx, ["tid1"]);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "tid1",
        { reserved: true },
        mockTx,
      );
    });
  });

  describe("cancelReservedTicketsIfAvailable", () => {
    it("should update only cancellable tickets", async () => {
      const tickets = [
        { id: "1", status: "DISABLED", reason: "RESERVED" },
        { id: "2", status: "ACTIVE", reason: "USED" },
      ] as any[];

      mockConverter.cancelReserved.mockReturnValue({ cancelled: true });

      await service.cancelReservedTicketsIfAvailable(mockCtx, tickets, "user-id", mockTx);

      expect(mockRepository.update).toHaveBeenCalledTimes(1);
      expect(mockRepository.update).toHaveBeenCalledWith(mockCtx, "1", { cancelled: true }, mockTx);
    });
  });

  describe("refundTickets", () => {
    it("should refund multiple tickets", async () => {
      mockConverter.refund.mockReturnValue({ refunded: true });
      mockRepository.update.mockResolvedValue({ id: "ticket" });

      await service.refundTickets(
        mockCtx,
        [{ id: "t1" }, { id: "t2" }] as any[],
        "user-id",
        "tx-id",
        mockTx,
      );

      expect(mockRepository.update).toHaveBeenCalledTimes(2);
    });
  });

  describe("purchaseTicket", () => {
    it("should create a purchased ticket", async () => {
      mockConverter.purchase.mockReturnValue({ purchased: true });
      mockRepository.create.mockResolvedValue({ id: "ticket" });

      const result = await service.purchaseTicket(
        mockCtx,
        "wallet-id",
        "utility-id",
        "tx-id",
        mockTx,
      );

      expect(mockRepository.create).toHaveBeenCalledWith(mockCtx, { purchased: true }, mockTx);
      expect(result).toEqual({ id: "ticket" });
    });
  });

  describe("refundTicket", () => {
    it("should refund a ticket", async () => {
      mockRepository.find.mockResolvedValue({ id: "ticket" });
      mockConverter.refund.mockReturnValue({ refunded: true });
      mockRepository.update.mockResolvedValue({ id: "ticket" });

      const result = await service.refundTicket(mockCtx, "ticket-id", "tx-id", mockTx);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "ticket-id",
        { refunded: true },
        mockTx,
      );
      expect(result).toEqual({ id: "ticket" });
    });

    it("should throw NotFoundError if ticket not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.refundTicket(mockCtx, "ticket-id", "tx-id", mockTx)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("useTicket", () => {
    it("should use a ticket", async () => {
      mockRepository.find.mockResolvedValue({ id: "ticket" });
      mockConverter.use.mockReturnValue({ used: true });
      mockRepository.update.mockResolvedValue({ id: "ticket" });

      const result = await service.useTicket(mockCtx, "ticket-id", mockTx);

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "ticket-id",
        { used: true },
        mockTx,
      );
      expect(result).toEqual({ id: "ticket" });
    });

    it("should throw NotFoundError if ticket not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.useTicket(mockCtx, "ticket-id", mockTx)).rejects.toThrow(NotFoundError);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
