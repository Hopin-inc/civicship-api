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

@injectable()
export default class OpportunityService {
  constructor(
    @inject("OpportunityRepository") private readonly repository: OpportunityRepository,
    @inject("OpportunityConverter") private readonly converter: OpportunityConverter,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  async fetchOpportunities(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryOpportunitiesArgs,
    take: number,
  ) {
    const where = this.converter.filter(ctx, filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findOpportunity(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
  }

  async findOpportunityAccessible(ctx: IContext, id: string, filter: GqlOpportunityFilterInput) {
    const where = this.converter.findAccessible(ctx, id, filter ?? {});

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
}
