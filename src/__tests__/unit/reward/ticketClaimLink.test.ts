import { ClaimLinkStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import TicketClaimLinkRepository from "@/application/domain/reward/ticketClaimLink/data/repository";
import { NotFoundError, ValidationError } from "@/errors/graphql";

jest.mock("@/application/domain/reward/ticketClaimLink/data/repository", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    update: jest.fn(),
  },
}));

describe("TicketClaimLinkService", () => {
  const ctx = {} as IContext;
  const tx = {} as any; // Prisma.TransactionClientのモック

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateBeforeClaim", () => {
    const claimLinkId = "claim-link-id";

    const errorStatuses = [ClaimLinkStatus.CLAIMED, ClaimLinkStatus.EXPIRED];
    const validStatuses = [ClaimLinkStatus.ISSUED];

    it("should throw NotFoundError if link not found", async () => {
      (TicketClaimLinkRepository.find as jest.Mock).mockResolvedValue(null);

      await expect(TicketClaimLinkService.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(
        NotFoundError,
      );
      expect(TicketClaimLinkRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });

    it.each(errorStatuses)("should throw ValidationError if link status is %s", async (status) => {
      (TicketClaimLinkRepository.find as jest.Mock).mockResolvedValue({
        id: claimLinkId,
        status,
      });

      await expect(TicketClaimLinkService.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(
        ValidationError,
      );
      expect(TicketClaimLinkRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });

    it.each(validStatuses)("should return link if status is %s", async (status) => {
      const validLink = {
        id: claimLinkId,
        status,
      };

      (TicketClaimLinkRepository.find as jest.Mock).mockResolvedValue(validLink);

      const result = await TicketClaimLinkService.validateBeforeClaim(ctx, claimLinkId);

      expect(result).toBe(validLink);
      expect(TicketClaimLinkRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });
  });

  describe("markAsClaimed", () => {
    const claimLinkId = "claim-link-id";
    const qty = 2;

    it("should call update with correct arguments", async () => {
      (TicketClaimLinkRepository.update as jest.Mock).mockResolvedValue({});

      await TicketClaimLinkService.markAsClaimed(ctx, claimLinkId, qty, tx);

      expect(TicketClaimLinkRepository.update).toHaveBeenCalledWith(
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

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
});
