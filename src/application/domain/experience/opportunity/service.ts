import {
  GqlOpportunityCreateInput,
  GqlOpportunityFilterInput,
  GqlOpportunityUpdateContentInput,
  GqlQueryOpportunitiesArgs,
} from "@/types/graphql";
import OpportunityRepository from "@/application/domain/experience/opportunity/data/repository";
import { Prisma, PublishStatus } from "@prisma/client";
import { IContext } from "@/types/server";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { getCurrentUserId } from "@/application/domain/utils";
import OpportunityConverter from "@/application/domain/experience/opportunity/data/converter";
import ImageService from "@/application/domain/content/image/service";
import { inject, injectable } from "tsyringe";
import { getAdvanceBookingDays } from "@/application/domain/experience/reservation/config";
import { PrismaOpportunityDetailWithSlots, PrismaOpportunityDetail } from "@/application/domain/experience/opportunity/data/type";
import { OpportunitySlotHostingStatus } from "@prisma/client";
import { subDays } from 'date-fns';

@injectable()
export default class OpportunityService {
  constructor(
    @inject("OpportunityRepository") private readonly repository: OpportunityRepository,
    @inject("OpportunityConverter") private readonly converter: OpportunityConverter,
    @inject("ImageService") private readonly imageService: ImageService,
  ) { }

  async fetchOpportunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryOpportunitiesArgs,
    take: number,
  ) {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    // Check if search filters are present
    const hasSearchFilters = this.hasSearchFilters(filter ?? {});

    if (hasSearchFilters) {
      // When search filters are present, return all matching opportunities
      return await this.repository.query(ctx, where, orderBy, take, cursor);
    }

    // When no search filters, filter out opportunities with all slots past deadline
    const result: PrismaOpportunityDetail[] = [];
    let currentCursor = cursor;
    const targetCount = take + 1; // +1 for pagination check

    // fetch in batches until we have enough
    while (result.length < targetCount) {
      const batchSize = Math.max((targetCount - result.length) * 2, 50); // 2x buffer, min 50

      const batch = await this.repository.queryWithSlots(ctx, where, orderBy, batchSize, currentCursor);

      if (batch.length === 0) break; // No more data

      // Filter and convert batch
      const filtered = this.filterOpportunitiesBySlotDeadlines(batch)
        .map(({ slots, ...opportunity }) => opportunity);

      result.push(...filtered);

      // Update cursor if we need more data
      if (batch.length < batchSize) break; // Reached end
      currentCursor = batch[batch.length - 1].id;
    }

    return result.slice(0, targetCount);
  }

  async findOpportunity(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findOpportunityAccessible(ctx: IContext, id: string, filter: GqlOpportunityFilterInput) {
    const where = this.converter.findAccessible(id, filter ?? {});

    const opportunity = await this.repository.findAccessible(ctx, where);
    if (!opportunity) {
      return null;
    }

    return opportunity;
  }

  async findOpportunityOrThrow(ctx: IContext, opportunityId: string) {
    const opportunity = await this.repository.find(ctx, opportunityId);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { opportunityId });
    }
    return opportunity;
  }

  async createOpportunity(
    ctx: IContext,
    input: GqlOpportunityCreateInput,
    communityId: string,
    tx: Prisma.TransactionClient,
  ) {
    const currentUserId = getCurrentUserId(ctx, input.createdBy);

    const { data, images } = this.converter.create(input, communityId, currentUserId);

    const uploadedImages: Prisma.ImageCreateWithoutOpportunitiesInput[] = await Promise.all(
      images.map((img) => this.imageService.uploadPublicImage(img, "opportunities")),
    );

    const createInput: Prisma.OpportunityCreateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await this.repository.create(ctx, createInput, tx);
  }

  async deleteOpportunity(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    await this.findOpportunityOrThrow(ctx, id);

    return await this.repository.delete(ctx, id, tx);
  }

  async updateOpportunityContent(
    ctx: IContext,
    id: string,
    input: GqlOpportunityUpdateContentInput,
    tx: Prisma.TransactionClient,
  ) {
    await this.findOpportunityOrThrow(ctx, id);

    const { data, images } = this.converter.update(input);

    const uploadedImages: Prisma.ImageCreateWithoutOpportunitiesInput[] = await Promise.all(
      images.map((img) => this.imageService.uploadPublicImage(img, "opportunities")),
    );

    const updateInput: Prisma.OpportunityUpdateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await this.repository.update(ctx, id, updateInput, tx);
  }

  async setOpportunityPublishStatus(
    ctx: IContext,
    id: string,
    status: PublishStatus,
    tx: Prisma.TransactionClient,
  ) {
    await this.findOpportunityOrThrow(ctx, id);

    return this.repository.setPublishStatus(ctx, id, status, tx);
  }

  async validatePublishStatus(
    allowedStatuses: PublishStatus[],
    filter?: GqlOpportunityFilterInput,
  ) {
    if (
      filter?.publishStatus &&
      !filter.publishStatus.every((status) => allowedStatuses.includes(status))
    ) {
      throw new ValidationError(
        `Validation error: publishStatus must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.publishStatus)],
      );
    }
  }

  /**
   * Check if search filters are present that should bypass slot deadline filtering
   */
  private hasSearchFilters(filter: GqlOpportunityFilterInput): boolean {
    return !!(
      filter.keyword ||
      filter.stateCodes ||
      filter.slotDateRange ||
      filter.slotRemainingCapacity
    );
  }

  /**
   * Filter opportunities by slot deadlines
   * Excludes opportunities where ALL slots are past booking deadline
   */
  private filterOpportunitiesBySlotDeadlines<T extends PrismaOpportunityDetailWithSlots>(
    opportunities: T[]
  ): T[] {
    const now = new Date();

    return opportunities.filter(opportunity => {
      // Always include opportunities with no slots
      if (!opportunity.slots || opportunity.slots.length === 0) {
        return true;
      }

      // Check if at least one slot is still bookable
      const hasBookableSlot = opportunity.slots.some(slot => {
        // Skip slots that are not scheduled
        if (slot.hostingStatus !== OpportunitySlotHostingStatus.SCHEDULED) {
          return false;
        }

        // Calculate booking deadline
        const advanceBookingDays = getAdvanceBookingDays(opportunity.id);
        const bookingDeadline = subDays(slot.startsAt, advanceBookingDays);

        // Slot is bookable if current time is before deadline
        return now <= bookingDeadline;
      });

      return hasBookableSlot;
    });
  }
}
