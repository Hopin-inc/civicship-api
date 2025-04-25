import { prismaClient } from "@/infrastructure/prisma/client";
import { Prisma, WalletType } from "@prisma/client";
import { refreshMaterializedViewCurrentPoints } from "@prisma/client/sql";
import { communityInclude } from "@/application/domain/community/data/type";
import { walletInclude } from "@/application/domain/membership/wallet/data/type";
import { transactionInclude } from "@/application/domain/transaction/data/type";
import { utilityInclude } from "@/application/domain/utility/data/type";
import { placeInclude } from "@/application/domain/place/data/type";
import { reservationInclude } from "@/application/domain/reservation/data/type";
import { participationInclude } from "@/application/domain/participation/data/type";
import { userInclude } from "@/application/domain/user/data/type";
import { ticketIssuerInclude } from "@/application/domain/ticketClaimLink/issuer/data/type";
import { ticketClaimLinkInclude } from "@/application/domain/ticketClaimLink/data/type";

export default class TestDataSourceHelper {
  private static db = prismaClient;

  static async findAll() {
    return this.db.user.findMany();
  }

  static async deleteAll() {
    await this.db.image.deleteMany();

    await this.db.participationStatusHistory.deleteMany();
    await this.db.participation.deleteMany();

    await this.db.reservation.deleteMany();

    await this.db.ticketStatusHistory.deleteMany();

    await this.db.ticketClaimLink.deleteMany();
    await this.db.ticketIssuer.deleteMany();

    await this.db.ticket.deleteMany();
    await this.db.transaction.deleteMany();

    await this.db.participationStatusHistory.deleteMany();
    await this.db.participation.deleteMany();

    await this.db.wallet.deleteMany();
    await this.db.utility.deleteMany();
    await this.db.membership.deleteMany();
    await this.db.opportunitySlot.deleteMany();
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

  static async createImage(data: Prisma.ImageCreateInput) {
    return this.db.image.create({
      data,
    });
  }

  // ======== User =========
  static async createUser(data: Prisma.UserCreateInput) {
    return this.db.user.create({
      data,
      include: {
        identities: true,
      },
    });
  }

  // ======== Community =========
  static async createCommunity(data: Prisma.CommunityCreateInput) {
    return this.db.community.create({
      data,
      include: communityInclude,
    });
  }

  static async findAllCommunity() {
    return this.db.community.findMany({});
  }

  // ======== Membership & Wallet =========
  static async createMembership(data: Prisma.MembershipCreateInput) {
    return this.db.membership.create({
      data,
      include: {
        community: { include: communityInclude },
        user: { include: userInclude },
      },
    });
  }

  static async createWallet(data: Prisma.WalletCreateInput) {
    return this.db.wallet.create({
      data,
      include: walletInclude,
    });
  }

  static async findWallet(walletId: string) {
    return this.db.wallet.findUnique({
      where: { id: walletId },
      include: walletInclude,
    });
  }

  static async findCommunityWallet(communityId: string) {
    return this.db.wallet.findFirst({
      where: { communityId, type: WalletType.COMMUNITY },
      include: walletInclude,
    });
  }

  // 引数にcommunityIdを追加するかは実装次第
  static async findMemberWallet(userId: string, communityId?: string) {
    return this.db.wallet.findFirst({
      where: {
        userId,
        type: WalletType.MEMBER,
        ...(communityId ? { communityId } : {}),
      },
      include: walletInclude,
    });
  }

  // ======== Opportunity & OpportunitySlot =========
  static async createOpportunity(data: Prisma.OpportunityCreateInput) {
    return this.db.opportunity.create({
      data,
      include: {
        community: { include: communityInclude },
        createdByUser: { include: userInclude },
        place: { include: placeInclude },
        images: true,
        requiredUtilities: { include: utilityInclude },
      },
    });
  }

  static async createOpportunitySlot(data: Prisma.OpportunitySlotCreateInput) {
    return this.db.opportunitySlot.create({
      data,
      // slotの include が必要ならここで設定
    });
  }

  // ======== Reservation (新ドメイン) ========
  static async createReservation(data: Prisma.ReservationCreateInput) {
    return this.db.reservation.create({
      data,
      include: reservationInclude,
    });
  }

  static async findReservationById(id: string) {
    return this.db.reservation.findUnique({
      where: { id },
      include: reservationInclude,
    });
  }

  static async findAllReservations() {
    return this.db.reservation.findMany({
      include: reservationInclude,
    });
  }

  // ======== Transaction =========
  static async findAllTransactions() {
    return this.db.transaction.findMany();
  }

  static async createTransaction(data: Prisma.TransactionCreateInput) {
    return this.db.transaction.create({
      data,
      include: transactionInclude,
    });
  }

  // ======== Utility =========
  static async createUtility(data: Prisma.UtilityCreateInput) {
    return this.db.utility.create({
      data,
      include: utilityInclude,
    });
  }

  // ======== TicketIssuer =========
  static async createTicketIssuer(data: Prisma.TicketIssuerCreateInput) {
    return this.db.ticketIssuer.create({
      data,
      include: ticketIssuerInclude,
    });
  }

  // ======== TicketClaimLink =========
  static async createTicketClaimLink(data: Prisma.TicketClaimLinkCreateInput) {
    return this.db.ticketClaimLink.create({
      data,
      include: ticketClaimLinkInclude,
    });
  }

  // ======== Place =========
  static async createPlace(data: Prisma.PlaceCreateInput) {
    return this.db.place.create({
      data,
      include: placeInclude,
    });
  }

  // ======== MaterializedView Refresh (ポイント集計など) =========
  static async refreshCurrentPoints() {
    return this.db.$queryRawTyped(refreshMaterializedViewCurrentPoints());
  }

  // ========== Participation関連 (不要になれば削除) =========
  static async createParticipation(data: Prisma.ParticipationCreateInput) {
    return this.db.participation.create({
      data,
      include: participationInclude,
    });
  }

  static async findParticipationById(id: string) {
    return this.db.participation.findUnique({
      where: { id },
      include: participationInclude,
    });
  }

  static async findAllParticipation() {
    return this.db.participation.findMany({});
  }
}
