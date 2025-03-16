import UtilityHistoryService from "@/app/utility/history/service";
import UtilityHistoryRepository from "@/infra/repositories/utility/history";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { UtilityHistory } from "@prisma/client"; // Prismaで取得される型を使います

jest.mock("@/infra/repositories/utility/history");

describe("UtilityHistoryService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("fetchUtilityHistories", () => {
        it("should fetch utility histories correctly", async () => {
            const mockHistories = [{ id: "1", walletId: "wallet1" }] as UtilityHistory[];
            (UtilityHistoryRepository.query as jest.Mock).mockResolvedValue(mockHistories);

            const result = await UtilityHistoryService.fetchUtilityHistories(ctx, { cursor: "1", filter: {} }, 10);

            expect(UtilityHistoryRepository.query).toHaveBeenCalledWith(
                ctx,
                expect.any(Object), // where condition (UtilityHistoryInputFormat.filter)
                expect.any(Object), // orderBy condition (UtilityHistoryInputFormat.sort)
                10,
                "1"
            );
            expect(result).toEqual(mockHistories);
        });
    });

    describe("findUtilityHistory", () => {
        it("should find a utility history by id", async () => {
            const mockHistory = { id: "1", walletId: "wallet1" } as UtilityHistory;
            (UtilityHistoryRepository.find as jest.Mock).mockResolvedValue(mockHistory);

            const result = await UtilityHistoryService.findUtilityHistory(ctx, "1");

            expect(UtilityHistoryRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockHistory);
        });
    });

    describe("findUnusedOrThrow", () => {
        it("should throw error if utility history is not found", async () => {
            (UtilityHistoryRepository.find as jest.Mock).mockResolvedValue(null);

            await expect(UtilityHistoryService.findUnusedOrThrow(ctx, "1")).rejects.toThrowError("No such UtilityHistory found.");
        });

        it("should throw error if utility history is already used", async () => {
            const mockHistory = { id: "1", usedAt: new Date() } as UtilityHistory;
            (UtilityHistoryRepository.find as jest.Mock).mockResolvedValue(mockHistory);

            await expect(UtilityHistoryService.findUnusedOrThrow(ctx, "1")).rejects.toThrowError("Utility is already used.");
        });

        it("should return the history if found and unused", async () => {
            const mockHistory = { id: "1", usedAt: null } as UtilityHistory;
            (UtilityHistoryRepository.find as jest.Mock).mockResolvedValue(mockHistory);

            const result = await UtilityHistoryService.findUnusedOrThrow(ctx, "1");

            expect(UtilityHistoryRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockHistory);
        });
    });

    describe("markAsUsed", () => {
        it("should mark a utility history as used", async () => {
            const mockHistory = { id: "1", usedAt: null } as UtilityHistory;
            const usedAt = new Date();
            (UtilityHistoryRepository.insertUsedAt as jest.Mock).mockResolvedValue(mockHistory);

            const result = await UtilityHistoryService.markAsUsed(ctx, "1", usedAt);

            expect(UtilityHistoryRepository.insertUsedAt).toHaveBeenCalledWith(ctx, "1", usedAt);
            expect(result).toEqual(mockHistory);
        });
    });

    describe("recordUtilityHistory", () => {
        it("should record a utility history correctly", async () => {
            const mockHistory = { id: "1", walletId: "wallet1", utilityId: "utility1", transactionId: "tx1" } as UtilityHistory;
            const tx = {} as Prisma.TransactionClient;
            const walletId = "wallet1";
            const utilityId = "utility1";
            const transactionId = "tx1";
            (UtilityHistoryRepository.create as jest.Mock).mockResolvedValue(mockHistory);

            await UtilityHistoryService.recordUtilityHistory(ctx, tx, walletId, utilityId, transactionId);

            expect(UtilityHistoryRepository.create).toHaveBeenCalledWith(
                ctx,
                expect.objectContaining({ transaction: { connect: { id: transactionId } }, utility: { connect: { id: utilityId } }, wallet: { connect: { id: walletId } } }),
                tx
            );
        });
    });
});
