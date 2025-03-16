import TransactionService from "@/app/transaction/service";
import TransactionRepository from "@/infra/repositories/transaction";
import { IContext } from "@/types/server";
import { Prisma, TransactionReason } from "@prisma/client";

jest.mock("@/infra/repositories/transaction");
jest.mock("@/infra/repositories/community");
jest.mock("@/infra/repositories/membership");
jest.mock("@/infra/repositories/opportunity");
jest.mock("@/infra/repositories/user");
jest.mock("@/infra/repositories/utility");

describe("All Services", () => {
    let ctx: IContext;
    let tx: Prisma.TransactionClient;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        tx = {} as Prisma.TransactionClient;
        jest.clearAllMocks();
    });

    describe("Transaction/service", () => {
        it("should return a list of transactions", async () => {
            const mockTransactions = {
                AND: [{ id: "1", reason: TransactionReason.POINT_ISSUED }],
            };
            (TransactionRepository.query as jest.Mock).mockResolvedValue(mockTransactions);

            const result = await TransactionService.fetchTransactions(ctx, {}, 10);

            expect(TransactionRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.objectContaining({ AND: expect.any(Array) }),
                expect.any(Array),
                10,
                undefined
            );
            expect(result).toEqual(mockTransactions);
        });

        it("should return a transaction by id", async () => {
            const mockTransaction = { id: "1", reason: TransactionReason.POINT_ISSUED };
            (TransactionRepository.find as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.findTransaction(ctx, "1");
            expect(TransactionRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockTransaction);
        });

        it("should give reward points", async () => {
            const input = {
                from: "user-1",
                to: "user-2",
                fromWalletId: "from-wallet",
                fromPointChange: -100,
                toWalletId: "to-wallet",
                toPointChange: 100,
                participationId: "participation-1"
            };
            const mockTransaction = { id: "1", ...input, reason: TransactionReason.POINT_REWARD };
            (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.giveRewardPoint(ctx, tx, input);
            expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining({
                fromPointChange: -100,
                toPointChange: 100,
            }), tx);
            expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx, tx);
            expect(result).toEqual(mockTransaction);
        });

        it("should issue community points", async () => {
            const input = { communityId: "community-1", to: "user-1", toWalletId: "to-wallet", toPointChange: 500 };
            const mockTransaction = { id: "2", ...input, reason: TransactionReason.POINT_ISSUED };
            (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);
            const result = await TransactionService.issueCommunityPoint(ctx, input);
            expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining({ toPointChange: 500 }));
            expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx);
            expect(result).toEqual(mockTransaction);
        });
    });
    it("should find an existing transaction by id", async () => {
        const mockTransaction = { id: "1", reason: TransactionReason.POINT_ISSUED };
        (TransactionRepository.find as jest.Mock).mockResolvedValue(mockTransaction);

        const result = await TransactionService.findExistingTransaction(ctx, "1");

        expect(TransactionRepository.find).toHaveBeenCalledWith(ctx, "1");
        expect(result).toEqual(mockTransaction);
    });

    it("should redeem utility and create transaction", async () => {
        const input = {
            from: "user-1",
            to: "user-2",
            fromWalletId: "from-wallet",
            fromPointChange: -100,
            toWalletId: "to-wallet",
            toPointChange: 100,
            participationId: "participation-1",
            transferPoints: 100
        };
        const mockTransaction = { id: "1", ...input, reason: TransactionReason.UTILITY_REDEEMED };
        (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

        const result = await TransactionService.redeemUtility(ctx, tx, input);

        expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining({ fromPointChange: -100, toPointChange: 100 }), tx);
        expect(TransactionRepository.refreshCurrentPoints).toHaveBeenCalledWith(ctx, tx);
        expect(result).toEqual(mockTransaction);
    });

});