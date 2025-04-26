import {
  GqlNestedPlaceConnectOrCreateInput,
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

export default class OpportunityService {
  static async fetchOpportunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryOpportunitiesArgs,
    take: number,
  ) {
    const where = OpportunityConverter.filter(filter ?? {});
    const orderBy = OpportunityConverter.sort(sort ?? {});

    return await OpportunityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findOpportunity(ctx: IContext, id: string) {
    return await OpportunityRepository.find(ctx, id);
  }

  static async findOpportunityAccessible(
    ctx: IContext,
    id: string,
    filter: GqlOpportunityFilterInput,
  ) {
    const where = OpportunityConverter.findAccessible(id, filter ?? {});

    const opportunity = await OpportunityRepository.findAccessible(ctx, where);
    if (!opportunity) {
      return null;
    }

    return opportunity;
  }

  static async findOpportunityOrThrow(ctx: IContext, opportunityId: string) {
    const opportunity = await OpportunityRepository.find(ctx, opportunityId);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { opportunityId });
    }
    return opportunity;
  }

  static async createOpportunity(ctx: IContext, input: GqlOpportunityCreateInput) {
    const currentUserId = getCurrentUserId(ctx);

    validatePlaceInput(input.place);
    const { data, images } = OpportunityConverter.create(input, currentUserId);

    const uploadedImages: Prisma.ImageCreateWithoutOpportunitiesInput[] = await Promise.all(
      images.map((img) => ImageService.uploadPublicImage(img, "opportunities")),
    );

    const createInput: Prisma.OpportunityCreateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await OpportunityRepository.create(ctx, createInput);
  }

  static async deleteOpportunity(ctx: IContext, id: string) {
    await this.findOpportunityOrThrow(ctx, id);

    return await OpportunityRepository.delete(ctx, id);
  }

  static async updateOpportunityContent(
    ctx: IContext,
    id: string,
    input: GqlOpportunityUpdateContentInput,
  ) {
    await this.findOpportunityOrThrow(ctx, id);
    validatePlaceInput(input.place);

    const { data, images } = OpportunityConverter.update(input);

    const uploadedImages: Prisma.ImageCreateWithoutOpportunitiesInput[] = await Promise.all(
      images.map((img) => ImageService.uploadPublicImage(img, "opportunities")),
    );

    const updateInput: Prisma.OpportunityUpdateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return await OpportunityRepository.update(ctx, id, updateInput);
  }

  static async setOpportunityPublishStatus(ctx: IContext, id: string, status: PublishStatus) {
    await this.findOpportunityOrThrow(ctx, id);

    return OpportunityRepository.setPublishStatus(ctx, id, status);
  }

  static async validatePublishStatus(
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
}

function validatePlaceInput(place?: GqlNestedPlaceConnectOrCreateInput): void {
  if (place) {
    if ((place.where && place.create) || (!place.where && !place.create)) {
      throw new ValidationError(`For Place, choose only one of "where" or "create."`, [
        JSON.stringify(place),
      ]);
    }
  }
}
