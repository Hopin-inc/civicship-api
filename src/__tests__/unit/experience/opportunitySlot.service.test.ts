import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunitySlotCreateInput,
  GqlOpportunitySlotUpdateInput,
  GqlQueryOpportunitySlotsArgs,
} from "@/types/graphql";
import OpportunitySlotConverter from "@/application/domain/experience/opportunitySlot/data/converter";
import OpportunitySlotRepository from "@/application/domain/experience/opportunitySlot/data/repository";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";

jest.mock("@/application/domain/experience/opportunitySlot/data/repository", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findByOpportunityId: jest.fn(),
    query: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock("@/application/domain/experience/opportunitySlot/data/converter", () => ({
  __esModule: true,
  default: {
    filter: jest.fn(),
    sort: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
  },
}));

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
      const mockSlots = [
        {
          id: "1",
          opportunityId: "1",
          startsAt: "2025-03-15T00:00:00Z",
          endsAt: "2025-03-15T01:00:00Z",
        },
      ];
      const args: GqlQueryOpportunitySlotsArgs = { filter: {}, sort: {}, cursor: undefined };
      const take = 10;

      (OpportunitySlotConverter.filter as jest.Mock).mockReturnValue({});
      (OpportunitySlotConverter.sort as jest.Mock).mockReturnValue({});
      (OpportunitySlotRepository.query as jest.Mock).mockResolvedValue(mockSlots);

      const result = await OpportunitySlotService.fetchOpportunitySlots(ctx, args, take);

      expect(OpportunitySlotConverter.filter).toHaveBeenCalledWith({});
      expect(OpportunitySlotConverter.sort).toHaveBeenCalledWith({});
      expect(OpportunitySlotRepository.query).toHaveBeenCalledWith(ctx, {}, {}, take, undefined);
      expect(result).toEqual(mockSlots);
    });
  });

  describe("findOpportunitySlot", () => {
    it("should find an opportunity slot by id", async () => {
      const mockSlot = {
        id: "1",
        opportunityId: "1",
        startsAt: "2025-03-15T00:00:00Z",
        endsAt: "2025-03-15T01:00:00Z",
      };
      const id = "1";

      (OpportunitySlotRepository.find as jest.Mock).mockResolvedValue(mockSlot);

      const result = await OpportunitySlotService.findOpportunitySlot(ctx, id);

      expect(OpportunitySlotRepository.find).toHaveBeenCalledWith(ctx, id);
      expect(result).toEqual(mockSlot);
    });
  });

  describe("fetchAllSlotByOpportunityId", () => {
    it("should fetch all opportunity slots by opportunityId", async () => {
      const mockSlots = [
        {
          id: "1",
          opportunityId: "1",
          startsAt: "2025-03-15T00:00:00Z",
          endsAt: "2025-03-15T01:00:00Z",
        },
      ];
      const opportunityId = "1";

      (OpportunitySlotRepository.findByOpportunityId as jest.Mock).mockResolvedValue(mockSlots);

      const result = await OpportunitySlotService.fetchAllSlotByOpportunityId(
        ctx,
        opportunityId,
        tx,
      );

      expect(OpportunitySlotRepository.findByOpportunityId).toHaveBeenCalledWith(
        ctx,
        opportunityId,
        tx,
      );
      expect(result).toEqual(mockSlots);
    });
  });

  describe("bulkCreateOpportunitySlots", () => {
    it("should bulk create opportunity slots", async () => {
      const inputs: GqlOpportunitySlotCreateInput[] = [
        { startsAt: new Date(), endsAt: new Date() },
      ];

      const mockConverted = [
        {
          opportunityId: "1",
          startsAt: inputs[0].startsAt,
          endsAt: inputs[0].endsAt,
        },
      ];

      (OpportunitySlotConverter.createMany as jest.Mock).mockReturnValue(mockConverted);
      (OpportunitySlotRepository.createMany as jest.Mock).mockResolvedValue(undefined);

      await OpportunitySlotService.bulkCreateOpportunitySlots(ctx, "1", inputs, tx);

      expect(OpportunitySlotRepository.createMany).toHaveBeenCalledWith(ctx, mockConverted, tx);
    });
  });

  describe("bulkUpdateOpportunitySlots", () => {
    it("should bulk update opportunity slots", async () => {
      const inputs: GqlOpportunitySlotUpdateInput[] = [
        { id: "1", startsAt: new Date(), endsAt: new Date() },
      ];

      (OpportunitySlotConverter.update as jest.Mock).mockReturnValue({});
      (OpportunitySlotRepository.update as jest.Mock).mockResolvedValue(undefined);

      await OpportunitySlotService.bulkUpdateOpportunitySlots(ctx, inputs, tx);

      expect(OpportunitySlotRepository.update).toHaveBeenCalledWith(ctx, "1", {}, tx);
    });

    it("should return nothing if inputs are empty", async () => {
      const inputs: GqlOpportunitySlotUpdateInput[] = [];

      await OpportunitySlotService.bulkUpdateOpportunitySlots(ctx, inputs, tx);

      expect(OpportunitySlotRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("bulkDeleteOpportunitySlots", () => {
    it("should bulk delete opportunity slots", async () => {
      const ids = ["1", "2"];

      (OpportunitySlotRepository.deleteMany as jest.Mock).mockResolvedValue(undefined);

      await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, ids, tx);

      expect(OpportunitySlotRepository.deleteMany).toHaveBeenCalledWith(ctx, ids, tx);
    });

    it("should return nothing if ids are empty", async () => {
      const ids: string[] = [];

      await OpportunitySlotService.bulkDeleteOpportunitySlots(ctx, ids, tx);

      expect(OpportunitySlotRepository.deleteMany).not.toHaveBeenCalled();
    });
  });
});
