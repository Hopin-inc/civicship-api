import "reflect-metadata";
import { container } from "tsyringe";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { NotFoundError } from "@/errors/graphql";
import { Prisma, PublishStatus, OpportunitySlotHostingStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import * as reservationConfig from "@/application/domain/experience/reservation/config";

class MockOpportunityRepository {
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  find = jest.fn();
  query = jest.fn();
  queryWithSlots = jest.fn();
  setPublishStatus = jest.fn();
}

class MockOpportunityConverter {
  create = jest.fn();
  update = jest.fn();
  filter = jest.fn();
  sort = jest.fn();
  findAccessible = jest.fn();
}

class MockImageService {
  uploadPublicImage = jest.fn();
}

describe("OpportunityService", () => {
  let service: OpportunityService;
  let mockRepository: MockOpportunityRepository;
  let mockConverter: MockOpportunityConverter;
  let mockImageService: MockImageService;
  const mockCtx = { currentUser: { id: "test-user-id" } } as unknown as IContext;
  const mockTx = {} as Prisma.TransactionClient;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockRepository = new MockOpportunityRepository();
    mockConverter = new MockOpportunityConverter();
    mockImageService = new MockImageService();

    container.register("OpportunityRepository", { useValue: mockRepository });
    container.register("OpportunityConverter", { useValue: mockConverter });
    container.register("ImageService", { useValue: mockImageService });

    service = container.resolve(OpportunityService);
  });

  describe("createOpportunity", () => {
    it("should create an opportunity with uploaded images", async () => {
      const input = { place: { where: { id: "place-id" } } } as any;

      mockConverter.create.mockReturnValue({
        data: { title: "Opportunity" },
        images: ["image-data"],
      });
      mockImageService.uploadPublicImage.mockResolvedValue({ id: "uploaded-image" });
      mockRepository.create.mockResolvedValue({ id: "created-opportunity" });

      const result = await service.createOpportunity(mockCtx, input, "community-id", mockTx);

      expect(mockConverter.create).toHaveBeenCalled();
      expect(mockImageService.uploadPublicImage).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(
        mockCtx,
        expect.objectContaining({
          title: "Opportunity",
          images: { create: [{ id: "uploaded-image" }] },
        }),
        mockTx,
      );
      expect(result).toEqual({ id: "created-opportunity" });
    });
  });

  describe("deleteOpportunity", () => {
    it("should delete an opportunity after finding it", async () => {
      mockRepository.find.mockResolvedValue({ id: "opportunity-1" });
      mockRepository.delete.mockResolvedValue({ id: "opportunity-1" });

      const result = await service.deleteOpportunity(mockCtx, "opportunity-1", mockTx);

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "opportunity-1");
      expect(mockRepository.delete).toHaveBeenCalledWith(mockCtx, "opportunity-1", mockTx);
      expect(result).toEqual({ id: "opportunity-1" });
    });

    it("should throw NotFoundError if opportunity not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(service.deleteOpportunity(mockCtx, "opportunity-1", mockTx)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("updateOpportunityContent", () => {
    it("should update an opportunity content with uploaded images", async () => {
      mockRepository.find.mockResolvedValue({ id: "opportunity-1" });

      mockConverter.update.mockReturnValue({
        data: { title: "Updated Opportunity" },
        images: ["image-1", "image-2"],
      });

      mockImageService.uploadPublicImage
        .mockResolvedValueOnce({ id: "uploaded-1" })
        .mockResolvedValueOnce({ id: "uploaded-2" });

      mockRepository.update.mockResolvedValue({ id: "opportunity-1" });

      const input = { place: { where: { id: "place-1" } } } as any;

      const result = await service.updateOpportunityContent(
        mockCtx,
        "opportunity-1",
        input,
        mockTx,
      );

      expect(mockConverter.update).toHaveBeenCalled();
      expect(mockImageService.uploadPublicImage).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockCtx,
        "opportunity-1",
        expect.objectContaining({
          title: "Updated Opportunity",
          images: {
            create: [{ id: "uploaded-1" }, { id: "uploaded-2" }],
          },
        }),
        mockTx,
      );
      expect(result).toEqual({ id: "opportunity-1" });
    });

    it("should throw NotFoundError if opportunity not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.updateOpportunityContent(mockCtx, "opportunity-1", {} as any, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("setOpportunityPublishStatus", () => {
    it("should set publish status after finding the opportunity", async () => {
      mockRepository.find.mockResolvedValue({ id: "opportunity-1" });
      mockRepository.setPublishStatus.mockResolvedValue({
        id: "opportunity-1",
        publishStatus: "PUBLISHED",
      });

      const result = await service.setOpportunityPublishStatus(
        mockCtx,
        "opportunity-1",
        "PUBLISHED" as any,
        mockTx,
      );

      expect(mockRepository.find).toHaveBeenCalledWith(mockCtx, "opportunity-1");
      expect(mockRepository.setPublishStatus).toHaveBeenCalledWith(
        mockCtx,
        "opportunity-1",
        "PUBLISHED",
        mockTx,
      );
      expect(result).toEqual({ id: "opportunity-1", publishStatus: "PUBLISHED" });
    });

    it("should throw NotFoundError if opportunity not found", async () => {
      mockRepository.find.mockResolvedValue(null);

      await expect(
        service.setOpportunityPublishStatus(mockCtx, "opportunity-1", "PUBLISHED" as any, mockTx),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("fetchOpportunities - Slot Deadline Filtering", () => {
    const mockFilter = {};
    const mockSort = {};
    const mockArgs = { cursor: undefined, filter: mockFilter, sort: mockSort };
    const take = 10;
    const mockCurrentTime = new Date('2025-01-15T10:00:00Z');

    beforeEach(() => {
      mockConverter.filter.mockReturnValue({});
      mockConverter.sort.mockReturnValue({});
      // Mock current time to 2025-01-15 10:00 UTC
      jest.useFakeTimers();
      jest.setSystemTime(mockCurrentTime);
      // Default advance booking days
      jest.spyOn(reservationConfig, 'getAdvanceBookingDays').mockReturnValue(3);
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    describe("Search Filter Bypass", () => {
      it("should bypass filtering when keyword filter is present", async () => {
        const filterWithKeyword = { keyword: "test" };
        const argsWithKeyword = { ...mockArgs, filter: filterWithKeyword };
        const expectedResult = [{ id: "opp1", title: "Test Opportunity" }];
        
        mockRepository.query.mockResolvedValue(expectedResult);
        
        const result = await service.fetchOpportunities(mockCtx, argsWithKeyword, take);
        
        expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, take, undefined);
        expect(mockRepository.queryWithSlots).not.toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
      });

      it("should bypass filtering when stateCodes filter is present", async () => {
        const filterWithStateCodes = { stateCodes: ["CA"] };
        const argsWithStateCodes = { ...mockArgs, filter: filterWithStateCodes };
        const expectedResult = [{ id: "opp1", title: "Test Opportunity" }];
        
        mockRepository.query.mockResolvedValue(expectedResult);
        
        const result = await service.fetchOpportunities(mockCtx, argsWithStateCodes, take);
        
        expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, take, undefined);
        expect(mockRepository.queryWithSlots).not.toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
      });

      it("should bypass filtering when slotDateRange filter is present", async () => {
        const filterWithSlotDateRange = { slotDateRange: { start: "2025-01-01T00:00:00Z", end: "2025-01-31T23:59:59Z" } } as any;
        const argsWithSlotDateRange = { ...mockArgs, filter: filterWithSlotDateRange };
        const expectedResult = [{ id: "opp1", title: "Test Opportunity" }];
        
        mockRepository.query.mockResolvedValue(expectedResult);
        
        const result = await service.fetchOpportunities(mockCtx, argsWithSlotDateRange, take);
        
        expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, take, undefined);
        expect(mockRepository.queryWithSlots).not.toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
      });

      it("should bypass filtering when slotRemainingCapacity filter is present", async () => {
        const filterWithSlotRemainingCapacity = { slotRemainingCapacity: 1 } as any;
        const argsWithSlotRemainingCapacity = { ...mockArgs, filter: filterWithSlotRemainingCapacity };
        const expectedResult = [{ id: "opp1", title: "Test Opportunity" }];
        
        mockRepository.query.mockResolvedValue(expectedResult);
        
        const result = await service.fetchOpportunities(mockCtx, argsWithSlotRemainingCapacity, take);
        
        expect(mockRepository.query).toHaveBeenCalledWith(mockCtx, {}, {}, take, undefined);
        expect(mockRepository.queryWithSlots).not.toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
      });
    });

    describe("Slot Deadline Filtering Logic", () => {
      it("should include opportunities with no slots", async () => {
        const opportunitiesWithSlots = [
          {
            id: "opp1",
            title: "Opportunity with empty slots",
            slots: []
          },
          {
            id: "opp2",
            title: "Opportunity with null slots",
            slots: null
          }
        ];
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        expect(mockRepository.queryWithSlots).toHaveBeenCalledWith(mockCtx, {}, {}, take * 2, undefined);
        expect(result).toHaveLength(2);
        expect(result.map(r => r.id)).toEqual(["opp1", "opp2"]);
        // Verify slots are removed from result
        result.forEach(opportunity => {
          expect(opportunity).not.toHaveProperty('slots');
        });
      });

      it("should exclude opportunities where all slots are past booking deadline", async () => {
        const opportunitiesWithSlots = [
          {
            id: "opp1",
            title: "Opportunity with past deadline slots",
            slots: [
              {
                id: "slot1",
                startsAt: new Date('2025-01-16T10:00:00Z'), // 1 day from now, but needs 3 days advance
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              },
              {
                id: "slot2",
                startsAt: new Date('2025-01-10T10:00:00Z'), // 5 days ago, definitely past deadline
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              }
            ]
          }
        ];
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        // Should be excluded because all slots are past booking deadline (need 3 days advance)
        expect(result).toHaveLength(0);
      });

      it("should include opportunities with at least one bookable slot", async () => {
        const opportunitiesWithSlots = [
          {
            id: "opp1",
            title: "Opportunity with mixed slots",
            slots: [
              {
                id: "slot1",
                startsAt: new Date('2025-01-16T10:00:00Z'), // 1 day from now, past deadline
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              },
              {
                id: "slot2",
                startsAt: new Date('2025-01-20T10:00:00Z'), // 5 days from now, bookable
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              }
            ]
          }
        ];
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("opp1");
        expect(result[0]).not.toHaveProperty('slots');
      });

      it("should only consider SCHEDULED slots for deadline calculation", async () => {
        const opportunitiesWithSlots = [
          {
            id: "opp1",
            title: "Opportunity with non-scheduled slots",
            slots: [
              {
                id: "slot1",
                startsAt: new Date('2025-01-20T10:00:00Z'), // Future date
                hostingStatus: OpportunitySlotHostingStatus.COMPLETED
              },
              {
                id: "slot2",
                startsAt: new Date('2025-01-25T10:00:00Z'), // Future date
                hostingStatus: OpportunitySlotHostingStatus.CANCELLED
              }
            ]
          }
        ];
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        // Should be excluded because no SCHEDULED slots
        expect(result).toHaveLength(0);
      });

      it("should use custom advance booking days per opportunity", async () => {
        jest.spyOn(reservationConfig, 'getAdvanceBookingDays')
          .mockImplementation((opportunityId) => {
            return opportunityId === 'opp1' ? 1 : 5; // Different booking days
          });
        
        const opportunitiesWithSlots = [
          {
            id: "opp1",
            title: "Opportunity with 1-day advance", 
            slots: [
              {
                id: "slot1",
                startsAt: new Date('2025-01-16T10:00:00Z'), // 1 day from now, bookable with 1-day advance
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              }
            ]
          },
          {
            id: "opp2",
            title: "Opportunity with 5-day advance",
            slots: [
              {
                id: "slot2", 
                startsAt: new Date('2025-01-16T10:00:00Z'), // 1 day from now, not bookable with 5-day advance
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              }
            ]
          }
        ];
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("opp1");
        expect(reservationConfig.getAdvanceBookingDays).toHaveBeenCalledWith("opp1");
        expect(reservationConfig.getAdvanceBookingDays).toHaveBeenCalledWith("opp2");
      });

      it("should handle edge case: slot starts exactly at deadline", async () => {
        const opportunitiesWithSlots = [
          {
            id: "opp1",
            title: "Opportunity at exact deadline",
            slots: [
              {
                id: "slot1",
                startsAt: new Date('2025-01-18T10:00:00Z'), // Exactly 3 days from now
                hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
              }
            ]
          }
        ];
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        // Should be included because current time (2025-01-15 10:00) <= deadline (2025-01-15 10:00)
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("opp1");
      });

      it("should respect take limit and remove slots from result", async () => {
        const opportunitiesWithSlots = Array.from({ length: 15 }, (_, i) => ({
          id: `opp${i + 1}`,
          title: `Opportunity ${i + 1}`,
          slots: [
            {
              id: `slot${i + 1}`,
              startsAt: new Date('2025-01-20T10:00:00Z'), // Future, bookable
              hostingStatus: OpportunitySlotHostingStatus.SCHEDULED
            }
          ]
        }));
        
        mockRepository.queryWithSlots.mockResolvedValue(opportunitiesWithSlots);
        
        const result = await service.fetchOpportunities(mockCtx, mockArgs, take);
        
        expect(result).toHaveLength(take + 1); // take + 1 for pagination
        result.forEach(opportunity => {
          expect(opportunity).not.toHaveProperty('slots');
        });
      });
    });
  });

  describe("validatePublishStatus", () => {
    it("should pass validation when filter publishStatus matches allowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should pass validation when filter publishStatus is subset of allowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should pass validation when filter is undefined", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];

      await expect(
        service.validatePublishStatus(allowedStatuses, undefined),
      ).resolves.not.toThrow();
    });

    it("should pass validation when filter publishStatus is undefined", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = {} as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should throw ValidationError when filter publishStatus contains disallowed status", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, "INVALID_STATUS"] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });

    it("should throw ValidationError when filter publishStatus is empty array", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should throw ValidationError with multiple disallowed statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE, "INVALID"] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });

    it("should handle duplicate statuses in filter", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should handle null and undefined edge cases", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];

      await expect(
        service.validatePublishStatus(allowedStatuses, null as any),
      ).resolves.not.toThrow();

      await expect(
        service.validatePublishStatus(allowedStatuses, { publishStatus: null } as any),
      ).resolves.not.toThrow();
    });

    it("should handle empty allowed statuses array", async () => {
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;

      await expect(
        service.validatePublishStatus([], filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of");
    });

    it("should handle very large arrays", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const largeArray = new Array(1000).fill(PublishStatus.PUBLIC);
      const filter = { publishStatus: largeArray } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should validate error message format", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC, COMMUNITY_INTERNAL");
    });

    it("should handle null and undefined edge cases", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];

      await expect(
        service.validatePublishStatus(allowedStatuses, null as any),
      ).resolves.not.toThrow();

      await expect(
        service.validatePublishStatus(allowedStatuses, { publishStatus: null } as any),
      ).resolves.not.toThrow();
    });

    it("should handle empty allowed statuses array", async () => {
      const filter = { publishStatus: [PublishStatus.PUBLIC] } as any;

      await expect(
        service.validatePublishStatus([], filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of");
    });

    it("should handle very large arrays", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL, PublishStatus.PRIVATE];
      const largeArray = new Array(1000).fill(PublishStatus.PUBLIC);
      const filter = { publishStatus: largeArray } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should handle mixed valid and invalid statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });

    it("should handle duplicate statuses in filter", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL];
      const filter = { publishStatus: [PublishStatus.PUBLIC, PublishStatus.PUBLIC, PublishStatus.COMMUNITY_INTERNAL] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).resolves.not.toThrow();
    });

    it("should handle mixed valid and invalid statuses", async () => {
      const allowedStatuses = [PublishStatus.PUBLIC];
      const filter = { publishStatus: [PublishStatus.PUBLIC, "INVALID_STATUS", PublishStatus.PRIVATE] } as any;

      await expect(
        service.validatePublishStatus(allowedStatuses, filter),
      ).rejects.toThrow("Validation error: publishStatus must be one of PUBLIC");
    });
  });
});
