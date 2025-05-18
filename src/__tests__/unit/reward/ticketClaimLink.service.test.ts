import "reflect-metadata";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import { NotFoundError, AlreadyUsedClaimLinkError, ClaimLinkExpiredError } from "@/errors/graphql";

enum ClaimLinkStatus {
  ISSUED = "ISSUED",
  CLAIMED = "CLAIMED",
  EXPIRED = "EXPIRED"
}

describe("TicketClaimLinkService", () => {
  // --- Mockクラス ---
  class MockTicketClaimLinkRepository {
    query = jest.fn();
    find = jest.fn();
    update = jest.fn();
  }

  // --- モックインスタンス ---
  let mockRepository: MockTicketClaimLinkRepository;
  let service: TicketClaimLinkService;

  const ctx = {} as IContext;
  const tx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new MockTicketClaimLinkRepository();
    service = new TicketClaimLinkService(mockRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateBeforeClaim", () => {
    const claimLinkId = "claim-link-id";

    const validStatuses = [ClaimLinkStatus.ISSUED];

    it("should throw NotFoundError if link not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });

    it.each([ClaimLinkStatus.CLAIMED])("should throw AlreadyUsedClaimLinkError if link status is %s", async (status) => {
      mockRepository.find.mockResolvedValue({
        id: claimLinkId,
        status,
      });

      await expect(service.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(AlreadyUsedClaimLinkError);
    });
    
    it.each([ClaimLinkStatus.EXPIRED])("should throw ClaimLinkExpiredError if link status is %s", async (status) => {
      mockRepository.find.mockResolvedValue({
        id: claimLinkId,
        status,
      });

      await expect(service.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(ClaimLinkExpiredError);
      expect(mockRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });

    it.each(validStatuses)("should return link if status is %s", async (status) => {
      const validLink = {
        id: claimLinkId,
        status,
      };

      mockRepository.find.mockResolvedValue(validLink);

      const result = await service.validateBeforeClaim(ctx, claimLinkId);

      expect(result).toBe(validLink);
      expect(mockRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });
  });

  describe("markAsClaimed", () => {
    const claimLinkId = "claim-link-id";
    const qty = 2;

    it("should call update with correct arguments", async () => {
      mockRepository.update.mockResolvedValue({});

      await service.markAsClaimed(ctx, claimLinkId, qty, tx);

      expect(mockRepository.update).toHaveBeenCalledWith(
        ctx,
        claimLinkId,
        expect.objectContaining({
          qty,
          status: ClaimLinkStatus.CLAIMED,
          claimedAt: expect.any(Date),
        }),
        tx,
      );
    });
  });
});
