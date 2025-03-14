import OpportunitySlotService from "@/app/opportunity/slot/service";
import OpportunitySlotRepository from "@/infra/repositories/opportunity/slot";
import OpportunitySlotInputFormat from "@/presentation/graphql/dto/opportunity/slot/input";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { GqlOpportunitySlotCreateInput, GqlOpportunitySlotUpdateInput, GqlQueryOpportunitySlotsArgs } from "@/types/graphql";

jest.mock("@/infra/repositories/opportunity/slot");
jest.mock("@/presentation/graphql/dto/opportunity/slot/input");

describe("OpportunitySlotService", () => {
    let ctx: IContext;
    let tx: Prisma.TransactionClient;

    beforeEach(() => {
        ctx = { user: { id: "test-user" } } as unknown as IContext;
        tx = {} as Prisma.TransactionClient;
        jest.clearAllMocks();
    });

    describe("fetchOpportunitySlots", () => {
        it("should fetch opportunity slots", async () => {
            const mockSlots = [{ id: "1", opportunityId: "1", startTime: "2025-03-15T00:00:00Z" }];
            const args: GqlQueryOpportunitySlotsArgs = { filter: {}, sort: {}, cursor: undefined };
            const take = 10;

            // モック設定
            (OpportunitySlotInputFormat.filter as jest.Mock).mockReturnValue({});
            (OpportunitySlotInputFormat.sort as jest.Mock).mockReturnValue({});
            (OpportunitySlotRepository.query as jest.Mock).mockResolvedValue(mockSlots);

            // メソッド実行
            const result = await OpportunitySlotService.fetchOpportunitySlots(ctx, args, take);

            // 検証
            expect(OpportunitySlotInputFormat.filter).toHaveBeenCalledWith({});
            expect(OpportunitySlotInputFormat.sort).toHaveBeenCalledWith({});
            expect(OpportunitySlotRepository.query).toHaveBeenCalledWith(ctx, {}, {}, take, undefined);
            expect(result).toEqual(mockSlots);
        });
    });

    describe("findOpportunitySlot", () => {
        it("should find an opportunity slot by id", async () => {
            const mockSlot = { id: "1", opportunityId: "1", startTime: "2025-03-15T00:00:00Z" };
            const id = "1";

            // モック設定
            (OpportunitySlotRepository.find as jest.Mock).mockResolvedValue(mockSlot);

            // メソッド実行
            const result = await OpportunitySlotService.findOpportunitySlot(ctx, id);

            // 検証
            expect(OpportunitySlotRepository.find).toHaveBeenCalledWith(ctx, id);
            expect(result).toEqual(mockSlot);
        });
    });

    describe("fetchAllSlotByOpportunityId", () => {
        it("should fetch all opportunity slots by opportunityId", async () => {
            const mockSlots = [{ id: "1", opportunityId: "1", startTime: "2025-03-15T00:00:00Z" }];
            const opportunityId = "1";

            // モック設定
            (OpportunitySlotRepository.findByOpportunityId as jest.Mock).mockResolvedValue(mockSlots);

            // メソッド実行
            const result = await OpportunitySlotService.fetchAllSlotByOpportunityId(ctx, opportunityId, tx);

            // 検証
            expect(OpportunitySlotRepository.findByOpportunityId).toHaveBeenCalledWith(ctx, opportunityId, tx);
            expect(result).toEqual(mockSlots);
        });
    });

    describe("bulkCreateOpportunitySlots", () => {
        it("should bulk create opportunity slots", async () => {

        });

        it("should return nothing if inputs are empty", async () => {
            const inputs: GqlOpportunitySlotCreateInput[] = [];

            // メソッド実行
            await OpportunitySlotService.bulkCreateOpportunitySlots(ctx, "1", inputs, tx);

            // 検証
            expect(OpportunitySlotRepository.createMany).not.toHaveBeenCalled();
        });
    });

    describe("bulkUpdateOpportunitySlots", () => {
        it("should bulk update opportunity slots", async () => {

        });

        it("should return nothing if inputs are empty", async () => {
            const inputs: GqlOpportunitySlotUpdateInput[] = [];

            // メソッド実行
            await OpportunitySlotService.bulkUpdateOpportunitySlots(ctx, inputs, tx);

            // 検証
            expect(OpportunitySlotRepository.update).not.toHaveBeenCalled();
        });
    });

    describe("bulkDeleteOpportunitySlots", () => {
        it("should bulk delete opportunity slots", async () => {
            const ids = ["1", "2"];

            // モック設定
            (OpportunitySlotRepository.deleteMany as jest.Mock).mockResolvedValue(undefined);

            // メソッド実行
            await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, ids, tx);

            // 検証
            expect(OpportunitySlotRepository.deleteMany).toHaveBeenCalledWith(ctx, ids, tx);
        });

        it("should return nothing if ids are empty", async () => {
            const ids: string[] = [];

            // メソッド実行
            await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, ids, tx);

            // 検証
            expect(OpportunitySlotRepository.deleteMany).not.toHaveBeenCalled();
        });
    });
});
