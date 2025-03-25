import { prismaClient } from "@/infrastructure/prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { opportunityInclude } from "@/application/opportunity/data/type";
import { communityInclude } from "@/application/community/data/type";
import { walletInclude } from "@/application/membership/wallet/data/type";
import { transactionInclude } from "@/application/transaction/data/type";
import { utilityInclude } from "@/application/utility/data/type";
import { participationInclude } from "@/application/participation/data/type";
import { placeInclude } from "@/application/place/data/type";
import { membershipInclude } from "@/application/membership/data/type";

export default class TestDataSourceHelper {
  private static db = prismaClient;

  static async findAll() {
    return this.db.user.findMany();
  }

  static async deleteAll() {
    await this.db.ticket.deleteMany();
    await this.db.ticketStatusHistory.deleteMany();
    await this.db.transaction.deleteMany();
    await this.db.opportunityInvitationHistory.deleteMany();
    await this.db.participationStatusHistory.deleteMany();
    await this.db.wallet.deleteMany();
    await this.db.utility.deleteMany();
    await this.db.membership.deleteMany();
    await this.db.participation.deleteMany();
    await this.db.opportunitySlot.deleteMany();
    await this.db.opportunityInvitation.deleteMany();
    await this.db.opportunity.deleteMany();
    await this.db.article.deleteMany();
    await this.db.community.deleteMany();
    await this.db.user.deleteMany();
    await this.db.place.deleteMany();
    await this.db.city.deleteMany();
    await this.db.state.deleteMany();
  }

  static async disconnect() {
    return await this.db.$disconnect();
  }

  static async create(data: Prisma.UserCreateInput) {
    return await this.db.user.create({
      data,
      include: {
        identities: true,
      },
    });
  }

  static async createCommunity(data: Prisma.CommunityCreateInput) {
    return await this.db.community.create({
      data,
      include: communityInclude,
    });
  }

  static async createMembership(data: Prisma.MembershipCreateInput) {
    return this.db.membership.create({
      data,
      include: membershipInclude,
    });
  }

  static async createWallet(data: Prisma.WalletCreateInput) {
    return await this.db.wallet.create({
      data,
      include: walletInclude,
    });
  }

  static async findCommunityWallet(communityId: string) {
    return await this.db.wallet.findFirst({
      where: { communityId, type: WalletType.COMMUNITY },
      include: walletInclude,
    });
  }

  static async findMemberWallet(userId: string) {
    return await this.db.wallet.findFirst({
      where: { userId, type: WalletType.MEMBER },
      include: walletInclude,
    });
  }

  static async findAllTransactions() {
    return await this.db.transaction.findMany();
  }

  static async createTransaction(data: Prisma.TransactionCreateInput) {
    return await this.db.transaction.create({
      data,
      include: transactionInclude,
    });
  }

  static async refreshCurrentPoints() {
    return await this.db.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  static async createUtility(data: Prisma.UtilityCreateInput) {
    return this.db.utility.create({
      data,
      include: utilityInclude,
    });
  }

  static async createOpportunity(data: Prisma.OpportunityCreateInput) {
    return await this.db.opportunity.create({
      data,
      include: opportunityInclude,
    });
  }

  static async createParticipation(data: Prisma.ParticipationCreateInput) {
    return await this.db.participation.create({
      data,
      include: participationInclude,
    });
  }

  static async createPlace(data: Prisma.PlaceCreateInput) {
    return await this.db.place.create({
      data,
      include: placeInclude,
    });
  }

  static async findParticipationById(id: string) {
    return await this.db.participation.findUnique({
      where: { id },
      include: participationInclude,
    });
  }

  static async findAllParticipation() {
    return this.db.participation.findMany({});
  }

  static async findAllCommunity() {
    return this.db.community.findMany({});
  }

  static async findAllMembership() {
    return this.db.membership.findMany({});
  }

  static async findMembershipById(userId: string, communityId: string) {
    return await this.db.membership.findUniqueOrThrow({
      where: {
        userId_communityId: {
          userId,
          communityId,
        },
      },
      include: membershipInclude,
    });
  }
}
