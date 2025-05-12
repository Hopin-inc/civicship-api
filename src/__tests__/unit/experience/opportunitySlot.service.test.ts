import "reflect-metadata";
import { container } from "tsyringe";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";
import { NotFoundError } from "@/errors/graphql";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

class MockOpportunitySlotRepository {
  query = jest.fn();
  find = jest.fn();
  findByOpportunityId = jest.fn();
  setHostingStatus = jest.fn();
  createMany = jest.fn();
  update = jest.fn();
  deleteMany = jest.fn();
}

class MockOpportunitySlotConverter {
  filter = jest.fn();
  sort = jest.fn();
  createMany = jest.fn();
  update = jest.fn();
}

describe("OpportunitySlotService", () => {
  let service: OpportunitySlotService;
  let mockRepository: MockOpportunitySlotRepository;
  let mockConverter: MockOpportunitySlotConverter;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockOpportunitySlotRepository();
    mockConverter = new MockOpportunitySlotConverter();

    container.register("OpportunitySlotRepository", { useValue: mockRepository });
    container.register("OpportunitySlotConverter", { useValue: mockConverter });

    service = container.resolve(OpportunitySlotService);
  });

  describe("setOpportunitySlotHostingStatus", () => {
    it("should set hosting status after finding the slot", async () => {
      mockRepository.find.mockResolvedValue({ id: "slot-1" });
      mockRepository.setHostingStatus.mockResolvedValue({ id: "slot-1", hostingStatus: "HOSTING" });

      const result = await service.setOpportunitySlotHostingStatus(
        mockCtx,
        "slot-1",
        "HOSTING" as any,
        mockTx,
      );

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "slot-1");
      expect(mockRepository.setHostingStatus).toHaveBeenCalledWith(
        mockCtx,
        "slot-1",
        "HOSTING",
        mockTx,
      );
      expect(result).toEqual({ id: "slot-1", hostingStatus: "HOSTING" });
    });

    it("should throw NotFoundError if slot not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.setOpportunitySlotHostingStatus(mockCtx, "slot-1", "HOSTING" as any, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("bulkCreateOpportunitySlots", () => {
    it("should do nothing if inputs are empty", async () => {
      await service.bulkCreateOpportunitySlots(mockCtx, "opportunity-1", [], mockTx);
      expect(mockRepository.createMany).not.toHaveBeenCalled();
    });

    it("should create slots if inputs are provided", async () => {
      const inputs = [{ startsAt: new Date() }] as any[];
      const converted = [{ startsAt: new Date() }];

      mockConverter.createMany.mockReturnValue(converted);
      mockRepository.createMany.mockResolvedValue(converted);

      const result = await service.bulkCreateOpportunitySlots(
        mockCtx,
        "opportunity-1",
        inputs,
        mockTx,
      );

      expect(mockConverter.createMany).toHaveBeenCalledWith("opportunity-1", inputs);
      expect(mockRepository.createMany).toHaveBeenCalledWith(mockCtx, converted, mockTx);
      expect(result).toEqual(converted);
    });
  });

  describe("bulkUpdateOpportunitySlots", () => {
    it("should do nothing if inputs are empty", async () => {
      await service.bulkUpdateOpportunitySlots(mockCtx, [], mockTx);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should update slots if inputs are provided", async () => {
      const inputs = [{ id: "slot-1" }] as any[];

      mockConverter.update.mockReturnValue({ updated: true });
      mockRepository.update.mockResolvedValue({ id: "slot-1" });

      const result = await service.bulkUpdateOpportunitySlots(mockCtx, inputs, mockTx);

      if (!result) {
        throw new Error("Result is undefined");
      }

      expect(mockConverter.update).toHaveBeenCalledWith(inputs[0]);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "slot-1",
        { updated: true },
        mockTx,
      );
      expect(result.length).toBe(1);
    });
  });

  describe("bulkDeleteOpportunitySlots", () => {
    it("should do nothing if ids are empty", async () => {
      await service.bulkDeleteOpportunitySlots(mockCtx, [], mockTx);
      expect(mockRepository.deleteMany).not.toHaveBeenCalled();
    });

    it("should delete slots if ids are provided", async () => {
      const ids = ["slot-1", "slot-2"];

      mockRepository.deleteMany.mockResolvedValue(ids);

      const result = await service.bulkDeleteOpportunitySlots(mockCtx, ids, mockTx);

      expect(mockRepository.deleteMany).toHaveBeenCalledWith(mockCtx, ids, mockTx);
      expect(result).toEqual(ids);
    });
  });
});
