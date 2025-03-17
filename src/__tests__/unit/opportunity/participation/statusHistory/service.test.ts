import ParticipationStatusHistoryService from "@/app/opportunity/participation/statusHistory/service";
import ParticipationStatusHistoryRepository from "@/infra/repositories/opportunity/participation/status-history";
import { IContext } from "@/types/server";
import { ParticipationStatus } from "@prisma/client";
import { GqlQueryParticipationStatusHistoriesArgs, GqlSortDirection } from "@/types/graphql";
import ParticipationStatusHistoryInputFormat from "@/presentation/graphql/dto/opportunity/participation/statusHistory/input";

jest.mock("@/infra/repositories/opportunity/participation/status-history");
jest.mock("@/presentation/graphql/dto/opportunity/participation/statusHistory/input");

describe("ParticipationStatusHistoryService", () => {
    let ctx: IContext;

    beforeEach(() => {
        ctx = { user: { id: "test-user" }, currentUser: { id: "test-user" } } as unknown as IContext;
        jest.clearAllMocks();
    });

    describe("fetchStatusHistories", () => {
        it("should fetch status histories with correct arguments", async () => {
            const mockHistories = [{ id: "1", status: ParticipationStatus.APPLIED }];
            (ParticipationStatusHistoryRepository.query as jest.Mock).mockResolvedValue(mockHistories);

            const args: GqlQueryParticipationStatusHistoriesArgs = {
                cursor: undefined,
                filter: {},
                sort: {},
            };
            const result = await ParticipationStatusHistoryService.fetchStatusHistories(ctx, args, 10);
            expect(ParticipationStatusHistoryRepository.query).toHaveBeenCalledWith(
                ctx,
                undefined,
                undefined,
                10,
                undefined
            );
            expect(result).toEqual(mockHistories);
        });
    });

    describe("findParticipationStatusHistory", () => {
        it("should fetch status history by id", async () => {
            const mockHistory = { id: "1", status: ParticipationStatus.APPLIED };
            (ParticipationStatusHistoryRepository.find as jest.Mock).mockResolvedValue(mockHistory);

            const result = await ParticipationStatusHistoryService.findParticipationStatusHistory(ctx, "1");
            expect(ParticipationStatusHistoryRepository.find).toHaveBeenCalledWith(ctx, "1");
            expect(result).toEqual(mockHistory);
        });
    });

    describe("recordParticipationHistory", () => {
        it("should record participation status history for each status", async () => {
            const mockData = { participationId: "1", status: ParticipationStatus.APPLIED, createdById: "user-id" };
            (ParticipationStatusHistoryInputFormat.create as jest.Mock).mockReturnValue(mockData);
            (ParticipationStatusHistoryRepository.create as jest.Mock).mockResolvedValue(undefined);

            const tx = {} as any;
            await ParticipationStatusHistoryService.recordParticipationHistory(ctx, tx, "1", ParticipationStatus.APPLIED, "user-id");
            expect(ParticipationStatusHistoryRepository.create).toHaveBeenCalledWith(ctx, mockData, tx);

        });

        it("should throw error if repository create fails", async () => {
            const mockData = { participationId: "1", status: ParticipationStatus.APPLIED, createdById: "user-id" };
            (ParticipationStatusHistoryInputFormat.create as jest.Mock).mockReturnValue(mockData);
            (ParticipationStatusHistoryRepository.create as jest.Mock).mockRejectedValue(new Error("Creation failed"));

            const tx = {} as any;
            await expect(ParticipationStatusHistoryService.recordParticipationHistory(ctx, tx, "1", ParticipationStatus.APPLIED, "user-id"))
                .rejects
                .toThrow("Creation failed");
        });
    });

    describe("filter and sort logic", () => {
        it("should correctly call filter and sort functions", async () => {
            const mockFilter = { status: ParticipationStatus.APPLIED };
            const mockSort = { createdAt: GqlSortDirection.Asc };
            (ParticipationStatusHistoryInputFormat.filter as jest.Mock).mockReturnValue(mockFilter);
            (ParticipationStatusHistoryInputFormat.sort as jest.Mock).mockReturnValue(mockSort);

            const args: GqlQueryParticipationStatusHistoriesArgs = {
                cursor: undefined,
                filter: mockFilter,
                sort: mockSort,
            };
            await ParticipationStatusHistoryService.fetchStatusHistories(ctx, args, 10);
            expect(ParticipationStatusHistoryInputFormat.filter).toHaveBeenCalledWith(mockFilter);
            expect(ParticipationStatusHistoryInputFormat.sort).toHaveBeenCalledWith(mockSort);
        });
    });

});
