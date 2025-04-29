import "reflect-metadata";
import TicketService from "@/application/domain/reward/ticket/service";
import { ValidationError } from "@/errors/graphql";

const mockRepository = {
  update: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  queryByIds: jest.fn(),
};

const mockConverter = {
  reserve: jest.fn(),
  cancelReserved: jest.fn(),
  refund: jest.fn(),
  purchase: jest.fn(),
  use: jest.fn(),
};

let service: TicketService;

beforeEach(() => {
  service = new TicketService(mockRepository as any, mockConverter as any);
  jest.clearAllMocks();
});

describe("TicketService", () => {
  describe("reserveManyTickets", () => {
    it("should throw if ticketIds not provided", async () => {
      await expect(
        service.reserveManyTickets(
          { currentUser: { id: "user1" } } as any,
          ["pid1"],
          {} as any,
          undefined,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it("should throw if participationIds and ticketIds mismatch", async () => {
      await expect(
        service.reserveManyTickets({ currentUser: { id: "user1" } } as any, ["pid1"], {} as any, [
          "tid1",
          "tid2",
        ]),
      ).rejects.toThrow(ValidationError);
    });

    it("should reserve tickets correctly", async () => {
      mockConverter.reserve.mockReturnValue({});
      await service.reserveManyTickets(
        { currentUser: { id: "user1" } } as any,
        ["pid1"],
        {} as any,
        ["tid1"],
      );
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe("cancelReservedTicketsIfAvailable", () => {
    it("should only cancel eligible tickets", async () => {
      const tickets = [
        { id: "1", status: "DISABLED", reason: "RESERVED" },
        { id: "2", status: "ENABLED", reason: "NONE" },
      ];
      mockConverter.cancelReserved.mockReturnValue({});
      await service.cancelReservedTicketsIfAvailable(
        { currentUser: { id: "user1" } } as any,
        tickets as any,
        "user1",
        {} as any,
      );
      expect(mockRepository.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("refundTickets", () => {
    it("should refund all tickets", async () => {
      mockConverter.refund.mockReturnValue({});
      await service.refundTickets(
        { currentUser: { id: "user1" } } as any,
        [{ id: "1" }] as any,
        "user1",
        "txid",
        {} as any,
      );
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe("purchaseTicket", () => {
    it("should create a purchased ticket", async () => {
      mockConverter.purchase.mockReturnValue({});
      await service.purchaseTicket(
        { currentUser: { id: "user1" } } as any,
        "wallet1",
        "utility1",
        "tx1",
        {} as any,
      );
      expect(mockRepository.create).toHaveBeenCalled();
    });
  });

  describe("refundTicket", () => {
    it("should refund ticket after verifying existence", async () => {
      mockRepository.find.mockResolvedValue({});
      mockConverter.refund.mockReturnValue({});
      await service.refundTicket(
        { currentUser: { id: "user1" } } as any,
        "ticket1",
        "tx1",
        {} as any,
      );
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe("useTicket", () => {
    it("should mark ticket as used", async () => {
      mockRepository.find.mockResolvedValue({});
      mockConverter.use.mockReturnValue({});
      await service.useTicket({ currentUser: { id: "user1" } } as any, "ticket1", {} as any);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });
});
