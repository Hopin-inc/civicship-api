import TicketService from "@/application/domain/ticket/service";
import TicketConverter from "@/application/domain/ticket/data/converter";
import TicketRepository from "@/application/domain/ticket/data/repository";
import { getCurrentUserId } from "@/application/domain/utils";
import { Prisma, TicketStatus, TicketStatusReason } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaTicket } from "@/application/domain/ticket/data/type";

jest.mock("@/application/domain/ticket/data/converter");
jest.mock("@/application/domain/ticket/data/repository");
jest.mock("@/application/domain/utils");

describe("TicketService", () => {
  const ctx = {} as IContext;
  const tx = {} as Prisma.TransactionClient;
  const currentUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    (getCurrentUserId as jest.Mock).mockReturnValue(currentUserId);
  });

  describe("purchaseManyTickets", () => {
    const walletId = "wallet-1";
    const utilityId = "utility-1";
    const transactionId = "txn-1";
    const participationIds = ["p1", "p2"];

    it("should convert and create tickets for each participation", async () => {
      const mockCreateInputs = [{ a: 1 }, { b: 2 }];
      const mockResults = [{ id: "t1" }, { id: "t2" }];

      (TicketConverter.purchase as jest.Mock)
        .mockReturnValueOnce(mockCreateInputs[0])
        .mockReturnValueOnce(mockCreateInputs[1]);
      (TicketRepository.create as jest.Mock)
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1]);

      const result = await TicketService.purchaseManyTickets(
        ctx,
        walletId,
        utilityId,
        transactionId,
        participationIds,
        tx,
      );

      expect(TicketConverter.purchase).toHaveBeenCalledTimes(2);
      expect(TicketRepository.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResults);
    });
  });

  describe("reserveManyTickets", () => {
    const tickets: PrismaTicket[] = [{ id: "t1" } as any, { id: "t2" } as any];
    const updateInput = { status: TicketStatus.DISABLED };

    it("should update all tickets with reserve input", async () => {
      (TicketConverter.reserve as jest.Mock).mockReturnValue(updateInput);
      (TicketRepository.update as jest.Mock).mockResolvedValue({});

      await TicketService.reserveManyTickets(ctx, tickets, tx);

      expect(TicketConverter.reserve).toHaveBeenCalledTimes(tickets.length);
      expect(TicketRepository.update).toHaveBeenCalledTimes(2);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, "t1", updateInput, tx);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, "t2", updateInput, tx);
    });
  });

  describe("cancelReservedTicketsIfAvailable", () => {
    const tickets: PrismaTicket[] = [
      {
        id: "t1",
        status: TicketStatus.DISABLED,
        reason: TicketStatusReason.RESERVED,
      },
      {
        id: "t2",
        status: TicketStatus.DISABLED,
        reason: TicketStatusReason.RESERVED,
      },
      {
        id: "t3",
        status: TicketStatus.AVAILABLE,
        reason: TicketStatusReason.PURCHASED,
      },
    ] as any;

    it("should update only reserved+disabled tickets", async () => {
      const cancelInput = { dummy: true };
      (TicketConverter.cancelReserved as jest.Mock).mockReturnValue(cancelInput);
      (TicketRepository.update as jest.Mock).mockResolvedValue({});

      await TicketService.cancelReservedTicketsIfAvailable(ctx, tickets, currentUserId, tx);

      expect(TicketRepository.update).toHaveBeenCalledTimes(2);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, "t1", cancelInput, tx);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, "t2", cancelInput, tx);
    });
  });

  describe("TicketService.refundTickets", () => {
    const tickets: PrismaTicket[] = [{ id: "t1" } as any, { id: "t2" } as any];
    const transactionId = "txn-123";

    it("should update all tickets with refund converter", async () => {
      const updateInput = { dummy: true };
      (TicketConverter.refund as jest.Mock).mockReturnValue(updateInput);
      (TicketRepository.update as jest.Mock).mockResolvedValue({});

      await TicketService.refundTickets(ctx, tickets, currentUserId, transactionId, tx);

      expect(TicketConverter.refund).toHaveBeenCalledTimes(2);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, "t1", updateInput, tx);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, "t2", updateInput, tx);
    });
  });

  describe("TicketService.purchaseTicket", () => {
    const walletId = "wallet-123";
    const utilityId = "utility-123";
    const transactionId = "txn-456";

    it("should create ticket using converter and repository", async () => {
      const createInput = { dummy: true };
      const resultTicket = { id: "t1" };

      (TicketConverter.purchase as jest.Mock).mockReturnValue(createInput);
      (TicketRepository.create as jest.Mock).mockResolvedValue(resultTicket);

      const result = await TicketService.purchaseTicket(
        ctx,
        walletId,
        utilityId,
        transactionId,
        tx,
      );

      expect(TicketConverter.purchase).toHaveBeenCalledWith(
        currentUserId,
        walletId,
        utilityId,
        transactionId,
      );
      expect(TicketRepository.create).toHaveBeenCalledWith(ctx, createInput, tx);
      expect(result).toBe(resultTicket);
    });
  });

  describe("TicketService.refundTicket", () => {
    const ticketId = "t1";
    const transactionId = "txn-789";

    it("should call findOrThrow and update with refund input", async () => {
      const refundInput = { status: TicketStatus.DISABLED };
      const mockTicket = { id: ticketId };

      jest.spyOn(TicketService, "findTicketOrThrow").mockResolvedValue(mockTicket as any);
      (TicketConverter.refund as jest.Mock).mockReturnValue(refundInput);
      (TicketRepository.update as jest.Mock).mockResolvedValue(mockTicket);

      const result = await TicketService.refundTicket(ctx, ticketId, transactionId, tx);

      expect(TicketService.findTicketOrThrow).toHaveBeenCalledWith(ctx, ticketId);
      expect(TicketConverter.refund).toHaveBeenCalledWith(currentUserId, transactionId);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, ticketId, refundInput, tx);
      expect(result).toBe(mockTicket);
    });
  });

  describe("TicketService.useTicket", () => {
    const ticketId = "t2";

    it("should call findOrThrow and update with use input", async () => {
      const useInput = { status: TicketStatus.DISABLED };
      const mockTicket = { id: ticketId };

      jest.spyOn(TicketService, "findTicketOrThrow").mockResolvedValue(mockTicket as any);
      (TicketConverter.use as jest.Mock).mockReturnValue(useInput);
      (TicketRepository.update as jest.Mock).mockResolvedValue(mockTicket);

      const result = await TicketService.useTicket(ctx, ticketId, tx);

      expect(TicketService.findTicketOrThrow).toHaveBeenCalledWith(ctx, ticketId);
      expect(TicketConverter.use).toHaveBeenCalledWith(currentUserId);
      expect(TicketRepository.update).toHaveBeenCalledWith(ctx, ticketId, useInput, tx);
      expect(result).toBe(mockTicket);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
});
