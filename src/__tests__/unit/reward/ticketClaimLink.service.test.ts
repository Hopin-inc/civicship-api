import "reflect-metadata";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { GqlClaimLinkStatus } from "@/types/graphql";

describe("TicketClaimLinkService", () => {
  // --- Mockクラス ---
  class MockTicketClaimLinkRepository {
    query = jest.fn();
    find = jest.fn();
    update = jest.fn();
  }

  class MockTicketClaimLinkConverter {
    filter = jest.fn();
    sort = jest.fn();
  }

  // --- モックインスタンス ---
  let mockRepository: MockTicketClaimLinkRepository;
  let mockConverter: MockTicketClaimLinkConverter;
  let service: TicketClaimLinkService;

  const ctx = {} as IContext;
  const tx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new MockTicketClaimLinkRepository();
    mockConverter = new MockTicketClaimLinkConverter();
    service = new TicketClaimLinkService(mockRepository, mockConverter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateBeforeClaim", () => {
    const claimLinkId = "claim-link-id";

    const errorStatuses = [GqlClaimLinkStatus.Claimed, GqlClaimLinkStatus.Expired];
    const validStatuses = [GqlClaimLinkStatus.Issued];

    it("should throw NotFoundError if link not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(NotFoundError);
      expect(mockRepository.find).toHaveBeenCalledWith(ctx, claimLinkId);
    });

    it.each(errorStatuses)("should throw ValidationError if link status is %s", async (status) => {
      mockRepository.find.mockResolvedValue({
        id: claimLinkId,
        status,
      });

      await expect(service.validateBeforeClaim(ctx, claimLinkId)).rejects.toThrow(ValidationError);
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
          status: "CLAIMED",
          claimedAt: expect.any(Date),
        }),
        tx,
      );
    });
  });
});
