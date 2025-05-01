import {
  GqlParticipationCreatePersonalRecordInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, ParticipationStatusReason, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { getCurrentUserId } from "@/application/domain/utils";
import { NotFoundError, ValidationError } from "@/errors/graphql";
import { PrismaParticipation } from "@/application/domain/experience/participation/data/type";
import { inject, injectable } from "tsyringe";
import {
  IParticipationRepository,
  IParticipationService,
} from "@/application/domain/experience/participation/data/interface";
import ParticipationConverter from "@/application/domain/experience/participation/data/converter";
import ImageService from "@/application/domain/content/image/service";

@injectable()
export default class ParticipationService implements IParticipationService {
  constructor(
    @inject("ParticipationRepository") private readonly repository: IParticipationRepository,
    @inject("ParticipationConverter") private readonly converter: ParticipationConverter,
    @inject("ImageService") private readonly imageService: ImageService,
  ) {}

  async fetchParticipations<T extends Prisma.ParticipationInclude>(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
    include?: T,
  ): Promise<Prisma.ParticipationGetPayload<{ include: T }>[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});
    return await this.repository.query(ctx, where, orderBy, take, cursor, include);
  }

  async findParticipation(ctx: IContext, id: string): Promise<PrismaParticipation | null> {
    return await this.repository.find(ctx, id);
  }

  async findParticipationOrThrow(ctx: IContext, id: string): Promise<PrismaParticipation> {
    const participation = await this.repository.find(ctx, id);
    if (!participation) {
      throw new NotFoundError(`ParticipationNotFound: ID=${id}`);
    }
    return participation;
  }

  async createParticipation(
    ctx: IContext,
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation> {
    const { data, images } = this.converter.create(input, currentUserId);

    const uploadedImages: Prisma.ImageCreateWithoutParticipationsInput[] = await Promise.all(
      images.map((img) => this.imageService.uploadPublicImage(img, "participations")),
    );

    const createInput: Prisma.ParticipationCreateInput = {
      ...data,
      images: {
        create: uploadedImages,
      },
    };

    return this.repository.create(ctx, createInput, tx);
  }

  async deleteParticipation(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaParticipation> {
    await this.findParticipationOrThrow(ctx, id);
    return this.repository.delete(ctx, id, tx);
  }

  async setStatus(
    ctx: IContext,
    id: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
    currentUserId?: string,
  ): Promise<PrismaParticipation> {
    const userId = currentUserId ?? getCurrentUserId(ctx);

    const data: Prisma.ParticipationUpdateInput = this.converter.setStatus(userId, status, reason);
    return this.repository.update(ctx, id, data, tx);
  }

  async bulkSetStatusByReservation(
    ctx: IContext,
    ids: string[],
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    return this.repository.bulkSetStatusByReservation(ctx, ids, status, reason, tx);
  }

  async bulkCancelParticipationsByOpportunitySlot(
    ctx: IContext,
    ids: string[],
    tx: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    return this.repository.bulkSetStatusByReservation(
      ctx,
      ids,
      ParticipationStatus.NOT_PARTICIPATING,
      ParticipationStatusReason.OPPORTUNITY_CANCELED,
      tx,
    );
  }

  validateDeletable(participation: PrismaParticipation): void {
    if (participation.reason !== ParticipationStatusReason.PERSONAL_RECORD) {
      throw new ValidationError("Only personal participation records can be deleted.", [
        `participation.reason: ${participation.reason}`,
      ]);
    }
  }
}
