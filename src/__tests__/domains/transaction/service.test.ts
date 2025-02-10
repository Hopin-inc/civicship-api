import TransactionService from "@/domains/transaction/service";
import TransactionRepository from "@/domains/transaction/repository";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";

jest.mock("@/domains/transaction/repository");
jest.mock("@/domains/community/repository");
jest.mock("@/domains/membership/repository");
jest.mock("@/domains/opportunity/repository");
jest.mock("@/domains/user/repository");
jest.mock("@/domains/utility/repository");

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
                AND: [{ id: "1", reason: "POINT_ISSUED" }],
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
            const mockTransaction = { id: "1", reason: "POINT_ISSUED" };
            (TransactionRepository.find as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.findTransaction(ctx, "1");
            expect(TransactionRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockTransaction);
        });

        it("should give reward points", async () => {
            const input = {
                from: "user-1",
                to: "user-2",
                fromPointChange: -100,
                toPointChange: 100,
                participationId: "participation-1"
            };
            const mockTransaction = { id: "1", ...input, reason: "PARTICIPATION_APPROVED" };
            (TransactionRepository.createWithTransaction as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.giveRewardPoint(ctx, tx, input);
            expect(TransactionRepository.createWithTransaction).toHaveBeenCalledWith(ctx, tx, expect.objectContaining(input));
            expect(TransactionRepository.refreshStat).toHaveBeenCalledWith(ctx, tx);
            expect(result).toEqual(mockTransaction);
        });

        it("should issue community points", async () => {
            const input = { communityId: "community-1", to: "user-1", toPointChange: 500 };
            const mockTransaction = { id: "2", ...input, reason: "POINT_ISSUED" };
            (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.issueCommunityPoint(ctx, input);
            expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining(input));
            expect(TransactionRepository.refreshStat).toHaveBeenCalledWith(ctx);
            expect(result).toEqual(mockTransaction);
        });

        it("should grant community points", async () => {
            const input = { from: "community-1", to: "user-2", fromPointChange: -50, toPointChange: 50 };
            const mockTransaction = { id: "3", ...input, reason: "GIFT" };
            (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.grantCommunityPoint(ctx, input);
            expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining(input));
            expect(TransactionRepository.refreshStat).toHaveBeenCalledWith(ctx);
            expect(result).toEqual(mockTransaction);
        });

        it("should donate self points", async () => {
            const input = { from: "user-1", to: "charity-1", fromPointChange: -200, toPointChange: 200 };
            const mockTransaction = { id: "4", ...input, reason: "GIFT" };
            (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.donateSelfPoint(ctx, input);
            expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining(input));
            expect(TransactionRepository.refreshStat).toHaveBeenCalledWith(ctx);
            expect(result).toEqual(mockTransaction);
        });

        it("should use utility", async () => {
            const input = { from: "user-1", to: "utility-1", fromPointChange: -300, toPointChange: 0, utilityId: "utility-1" };
            const mockTransaction = { id: "5", ...input, reason: "UTILITY_USAGE" };
            (TransactionRepository.create as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await TransactionService.useUtility(ctx, input);
            expect(TransactionRepository.create).toHaveBeenCalledWith(ctx, expect.objectContaining(input));
            expect(TransactionRepository.refreshStat).toHaveBeenCalledWith(ctx);
            expect(result).toEqual(mockTransaction);
        });
    });
});