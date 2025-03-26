// import OpportunitySlotService from "@/app/opportunity/slot/service";
// import OpportunitySlotRepository from "@/infra/repositories/opportunity/slot";
// import OpportunitySlotInputFormat from "@/presentation/graphql/dto/opportunity/slot/input";
// import { IContext } from "@/types/server";
// import { Prisma } from "@prisma/client";
// import { GqlOpportunitySlotCreateInput, GqlOpportunitySlotUpdateInput, GqlQueryOpportunitySlotsArgs } from "@/types/graphql";
//
// jest.mock("@/infra/repositories/opportunity/slot");
// jest.mock("@/presentation/graphql/dto/opportunity/slot/input");
//
// describe("OpportunitySlotService", () => {
//     let ctx: IContext;
//     let tx: Prisma.TransactionClient;
//
//     beforeEach(() => {
//         ctx = { user: { id: "test-user" } } as unknown as IContext;
//         tx = {} as Prisma.TransactionClient;
//         jest.clearAllMocks();
//     });
//
//     describe("fetchOpportunitySlots", () => {
//         it("should fetch opportunity slots", async () => {
//             const mockSlots = [{ id: "1", opportunityId: "1", startsAt: "2025-03-15T00:00:00Z", endsAt: "2025-03-15T01:00:00Z" }];
//             const args: GqlQueryOpportunitySlotsArgs = { filter: {}, sort: {}, cursor: undefined };
//             const take = 10;
//
//             (OpportunitySlotInputFormat.filter as jest.Mock).mockReturnValue({});
//             (OpportunitySlotInputFormat.sort as jest.Mock).mockReturnValue({});
//             (OpportunitySlotRepository.query as jest.Mock).mockResolvedValue(mockSlots);
//
//             const result = await OpportunitySlotService.fetchOpportunitySlots(ctx, args, take);
//
//             expect(OpportunitySlotInputFormat.filter).toHaveBeenCalledWith({});
//             expect(OpportunitySlotInputFormat.sort).toHaveBeenCalledWith({});
//             expect(OpportunitySlotRepository.query).toHaveBeenCalledWith(ctx, {}, {}, take, undefined);
//             expect(result).toEqual(mockSlots);
//         });
//     });
//
//     describe("findOpportunitySlot", () => {
//         it("should find an opportunity slot by id", async () => {
//             const mockSlot = { id: "1", opportunityId: "1", startsAt: "2025-03-15T00:00:00Z", endsAt: "2025-03-15T01:00:00Z" };
//             const id = "1";
//
//             (OpportunitySlotRepository.find as jest.Mock).mockResolvedValue(mockSlot);
//
//             const result = await OpportunitySlotService.findOpportunitySlot(ctx, id);
//
//             expect(OpportunitySlotRepository.find).toHaveBeenCalledWith(ctx, id);
//             expect(result).toEqual(mockSlot);
//         });
//     });
//
//     describe("fetchAllSlotByOpportunityId", () => {
//         it("should fetch all opportunity slots by opportunityId", async () => {
//             const mockSlots = [{ id: "1", opportunityId: "1", startsAt: "2025-03-15T00:00:00Z", endsAt: "2025-03-15T01:00:00Z" }];
//             const opportunityId = "1";
//
//             (OpportunitySlotRepository.findByOpportunityId as jest.Mock).mockResolvedValue(mockSlots);
//
//             const result = await OpportunitySlotService.fetchAllSlotByOpportunityId(ctx, opportunityId, tx);
//
//             expect(OpportunitySlotRepository.findByOpportunityId).toHaveBeenCalledWith(ctx, opportunityId, tx);
//             expect(result).toEqual(mockSlots);
//         });
//     });
//
//     describe("bulkCreateOpportunitySlots", () => {
//         it("should bulk create opportunity slots", async () => {
//             const inputs: GqlOpportunitySlotCreateInput[] = [
//                 { startsAt: new Date(), endsAt: new Date() }
//             ];
//
//             (OpportunitySlotInputFormat.create as jest.Mock).mockReturnValue({});
//             (OpportunitySlotRepository.createMany as jest.Mock).mockResolvedValue(undefined);
//
//             await OpportunitySlotService.bulkCreateOpportunitySlots(ctx, "1", inputs, tx);
//
//             expect(OpportunitySlotRepository.createMany).toHaveBeenCalledWith(ctx, expect.any(Array), tx);
//         });
//
//         it("should return nothing if inputs are empty", async () => {
//             const inputs: GqlOpportunitySlotCreateInput[] = [];
//
//             await OpportunitySlotService.bulkCreateOpportunitySlots(ctx, "1", inputs, tx);
//
//             expect(OpportunitySlotRepository.createMany).not.toHaveBeenCalled();
//         });
//     });
//
//     describe("bulkUpdateOpportunitySlots", () => {
//         it("should bulk update opportunity slots", async () => {
//             const inputs: GqlOpportunitySlotUpdateInput[] = [
//                 { id: "1", startsAt: new Date(), endsAt: new Date() }
//             ];
//
//             (OpportunitySlotInputFormat.update as jest.Mock).mockReturnValue({});
//             (OpportunitySlotRepository.update as jest.Mock).mockResolvedValue(undefined);
//
//             await OpportunitySlotService.bulkUpdateOpportunitySlots(ctx, inputs, tx);
//
//             expect(OpportunitySlotRepository.update).toHaveBeenCalledWith(ctx, "1", {}, tx);
//         });
//
//         it("should return nothing if inputs are empty", async () => {
//             const inputs: GqlOpportunitySlotUpdateInput[] = [];
//
//             await OpportunitySlotService.bulkUpdateOpportunitySlots(ctx, inputs, tx);
//
//             expect(OpportunitySlotRepository.update).not.toHaveBeenCalled();
//         });
//     });
//
//     describe("bulkDeleteOpportunitySlots", () => {
//         it("should bulk delete opportunity slots", async () => {
//             const ids = ["1", "2"];
//
//             (OpportunitySlotRepository.deleteMany as jest.Mock).mockResolvedValue(undefined);
//
//             await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, ids, tx);
//
//             expect(OpportunitySlotRepository.deleteMany).toHaveBeenCalledWith(ctx, ids, tx);
//         });
//
//         it("should return nothing if ids are empty", async () => {
//             const ids: string[] = [];
//
//             await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, ids, tx);
//
//             expect(OpportunitySlotRepository.deleteMany).not.toHaveBeenCalled();
//         });
//     });
// });
