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
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return await this.repository.query(ctx, where, orderBy, take, cursor);
  }

  async findOpportunity(ctx: IContext, id: string) {
    return await this.repository.find(ctx, id);
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

    const uploadedImages: Prisma.ImageCreateWithoutOpportunitiesInput[] = (
      await Promise.all(
        images.map((img) => this.imageService.uploadPublicImage(img, "opportunities")),
      )
    ).filter((img): img is Prisma.ImageCreateWithoutOpportunitiesInput => img !== null);

    const createInput: Prisma.OpportunityCreateInput = {
      ...data,
      images:
        uploadedImages.length > 0
          ? {
              create: uploadedImages,
            }
          : undefined,
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

    const currentUserId = getCurrentUserId(ctx, input.createdBy);

    const { data, images } = this.converter.update(input, currentUserId);

    const uploadedImages: Prisma.ImageCreateWithoutOpportunitiesInput[] = (
      await Promise.all(
        images.map((img) => this.imageService.uploadPublicImage(img, "opportunities")),
      )
    ).filter((img): img is Prisma.ImageCreateWithoutOpportunitiesInput => img !== null);

    const updateInput: Prisma.OpportunityUpdateInput = {
      ...data,
      images:
        uploadedImages.length > 0
          ? {
              deleteMany: {},
              create: uploadedImages,
            }
          : undefined,
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

  async isOwnedByUser(ctx: IContext, opportunityId: string, userId: string): Promise<boolean> {
    const count = await ctx.issuer.public(ctx, (tx) => {
      return tx.opportunity.count({
        where: {
          id: opportunityId,
          createdBy: userId,
        },
      });
    });

    return count > 0;
  }
}
