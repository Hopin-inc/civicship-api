import { prismaClient } from "@/infrastructure/prisma/client";
import { prismaClient } from "@/infra/prisma/client";
import { communityInclude } from "@/infra/prisma/types/community";
import { walletInclude } from "@/infra/prisma/types/membership/wallet";
import { opportunityInclude } from "@/infra/prisma/types/opportunity";
import { participationInclude } from "@/infra/prisma/types/opportunity/participation";
import { placeInclude } from "@/infra/prisma/types/place";
import { transactionInclude } from "@/infra/prisma/types/transaction";
import { utilityInclude } from "@/infra/prisma/types/utility";
import { Prisma, WalletType } from "@prisma/client";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";

export default class TestDataSourceHelper {
  private static db = prismaClient;

  static async findAll() {
    return this.db.user.findMany();
  }

  static async deleteAll() {
    await this.db.utilityHistory.deleteMany();
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

  static async createCommunity(
    data: Prisma.CommunityCreateInput
  ) {
    return await this.db.community.create({
      data,
      include: communityInclude,
    });
  }

  static async createWallet(
    data: Prisma.WalletCreateInput,
  ) {
    return await this.db.wallet.create({
      data,
      include: walletInclude,
    });
  };

  static async findCommunityWallet(
    communityId: string,
  ) {
    return await this.db.wallet.findFirst({
      where: { communityId, type: WalletType.COMMUNITY },
      include: walletInclude,
    });
  }

  static async findMemberWallet(
    userId: string,
  ) {
    return await this.db.wallet.findFirst({
      where: { userId, type: WalletType.MEMBER },
      include: walletInclude,
    });
  }

  static async findAllTransactions() {
    return await this.db.transaction.findMany();
  };


  static async createTransaction(
    data: Prisma.TransactionCreateInput,
  ) {
    return await this.db.transaction.create({
      data,
      include: transactionInclude,
    });
  };


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
    return this.db.participation.findMany({
    });
  }

  static async findAllCommunity() {
    return this.db.community.findMany({
    });
  }
}
