import {
  GqlParticipationApplyInput,
  GqlParticipationUpdateStatusInput,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";
import ParticipationInputFormat from "@/domains/opportunity/subdomains/paricipation/presenter/input";
import ParticipationRepository from "@/domains/opportunity/subdomains/paricipation/repository";
import ParticipationStatusHistoryRepository from "@/domains/opportunity/subdomains/participationStatusHistory/repository";
import ParticipationStatusHistoryInputFormat from "@/domains/opportunity/subdomains/participationStatusHistory/presenter/input";
import { prismaClient } from "@/prisma/client";
import OpportunityRepository from "@/domains/opportunity/repository";

export default class ParticipationService {
  static async fetchParticipations(
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
  ) {
    const where = ParticipationInputFormat.filter(filter ?? {});
    const orderBy = ParticipationInputFormat.sort(sort ?? {});

    return await ParticipationRepository.query(where, orderBy, take, cursor);
  }

  static async findParticipation(id: string) {
    return await ParticipationRepository.find(id);
  }

  static async applyParticipation(input: GqlParticipationApplyInput) {
    const data: Prisma.ParticipationCreateInput = ParticipationInputFormat.apply(input);

    return await prismaClient.$transaction(async (tx) => {
      const opportunity = await OpportunityRepository.findWithTransaction(tx, input.opportunityId);

      if (!opportunity) {
        throw new Error(`OpportunityNotFound: ID=${input.opportunityId}`);
      }

      const participationStatus = opportunity.requireApproval
        ? ParticipationStatus.APPLIED
        : ParticipationStatus.PARTICIPATING;

      const participation = await ParticipationRepository.createWithTransaction(tx, {
        ...data,
        status: participationStatus,
      });

      const history: Prisma.ParticipationStatusHistoryCreateInput =
        ParticipationStatusHistoryInputFormat.create({
          participationId: participation.id,
          status: participationStatus,
          createdById: input.createdById,
        });
      await ParticipationStatusHistoryRepository.createWithTransaction(tx, history);

      return participation;
    });
  }

  static async cancelApplication(id: string, input: GqlParticipationUpdateStatusInput) {
    return this.updateParticipationWithHistory(id, ParticipationStatus.CANCELED, input.createdById);
  }

  static async approveApplication(id: string, input: GqlParticipationUpdateStatusInput) {
    return this.updateParticipationWithHistory(
      id,
      ParticipationStatus.PARTICIPATING,
      input.createdById,
    );
  }

  static async denyApplication(id: string, input: GqlParticipationUpdateStatusInput) {
    return this.updateParticipationWithHistory(
      id,
      ParticipationStatus.NOT_PARTICIPATING,
      input.createdById,
    );
  }

  static async approvePerformance(id: string, input: GqlParticipationUpdateStatusInput) {
    return this.updateParticipationWithHistory(id, ParticipationStatus.APPROVED, input.createdById);
  }

  static async denyPerformance(id: string, input: GqlParticipationUpdateStatusInput) {
    return this.updateParticipationWithHistory(id, ParticipationStatus.DENIED, input.createdById);
  }

  private static async updateParticipationWithHistory(
    id: string,
    status: ParticipationStatus,
    createdById: string,
  ) {
    return await prismaClient.$transaction(async (tx) => {
      const participation = await ParticipationRepository.updateStatusWithTransaction(
        tx,
        id,
        status,
      );

      const history: Prisma.ParticipationStatusHistoryCreateInput =
        ParticipationStatusHistoryInputFormat.create({
          participationId: id,
          status,
          createdById,
        });
      await ParticipationStatusHistoryRepository.createWithTransaction(tx, history);

      return participation;
    });
  }
}
