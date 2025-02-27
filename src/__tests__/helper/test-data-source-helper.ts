import { prismaClient } from "@/infra/prisma/client";
import { communityInclude } from "@/infra/prisma/types/community";
import { walletInclude } from "@/infra/prisma/types/membership/wallet";
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
    await Promise.all([
      this.db.transaction.deleteMany(),
      this.db.utilityHistory.deleteMany(),
      this.db.opportunityInvitationHistory.deleteMany(),
      this.db.participationStatusHistory.deleteMany(),
    ]);

    await Promise.all([
      this.db.wallet.deleteMany(),
      this.db.utility.deleteMany(),
      this.db.membership.deleteMany(),
      this.db.participation.deleteMany(),
      this.db.opportunitySlot.deleteMany(),
      this.db.opportunityInvitation.deleteMany(),
      this.db.opportunity.deleteMany(),
      this.db.article.deleteMany(),
    ]);

    await Promise.all([
      this.db.community.deleteMany(),
      this.db.user.deleteMany(),
      this.db.place.deleteMany(),
      this.db.city.deleteMany(),
      this.db.state.deleteMany(),
    ]);
  }

  static async disconnect() {
    return this.db.$disconnect();
  }

  static async create(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      include: {
        identities: true,
      },
    });
  }

  static async createCommunity(
    data: Prisma.CommunityCreateInput
  ) {
    return this.db.community.create({
      data,
      include: communityInclude,
    });
  }

  static async createWallet(
    data: Prisma.WalletCreateInput,
  ) {
    return this.db.wallet.create({
      data,
      include: walletInclude,
    });
  };

  static async findCommunityWallet(
    communityId: string,
  ) {
    return this.db.wallet.findFirst({
      where: { communityId, type: WalletType.COMMUNITY },
      include: walletInclude,
    });
  }

  static async findMemberWallet(
    userId: string,
  ) {
    return this.db.wallet.findFirst({
      where: { userId, type: WalletType.MEMBER },
      include: walletInclude,
    });
  }

  static async findAllTransactions() {
    return this.db.transaction.findMany();
  };


  static async createTransaction(
    data: Prisma.TransactionCreateInput,
  ) {
    return this.db.transaction.create({
      data,
      include: transactionInclude,
    });
  };


  static async refreshCurrentPoints() {
    return this.db.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  static async createUtility(data: Prisma.UtilityCreateInput) {
    return this.db.utility.create({
      data,
      include: utilityInclude,
    });
  }

  // TODO: 実際テストで使うメソッドを整える

  // static async query(
  //   where: Prisma.UserWhereInput,
  //   orderBy: Prisma.UserOrderByWithRelationInput,
  //   take: number,
  //   cursor?: string,
  // ) {
  //   return this.db.user.findMany({
  //     where,
  //     orderBy,
  //     include: userGetInclude,
  //     take: take + 1,
  //     skip: cursor ? 1 : 0,
  //     cursor: cursor ? { id: cursor } : undefined,
  //   });
  // }

  // static async checkExists(id: string) {
  //   return this.db.user.findUnique({
  //     where: { id },
  //   });
  // }

  // static async find(id: string) {
  //   return this.db.user.findUnique({
  //     where: { id },
  //     include: userGetInclude,
  //   });
  // }

  // static async findForUpdateContent(id: string) {
  //   return this.db.user.findUnique({
  //     where: { id },
  //     include: userUpdateContentInclude,
  //   });
  // }

  // static async updateContent(id: string, data: Prisma.UserUpdateInput) {
  //   return this.db.user.update({
  //     where: { id },
  //     data,
  //     include: userUpdateContentInclude,
  //   });
  // }

  // static async switchPrivacy(id: string, isPublic: boolean) {
  //   return this.db.user.update({
  //     where: { id },
  //     data: { isPublic: isPublic },
  //   });
  // }

  // static async updateRelation(id: string, data: Prisma.UserUpdateInput) {
  //   return this.db.user.update({
  //     where: { id },
  //     data: data,
  //   });
  // }
}
