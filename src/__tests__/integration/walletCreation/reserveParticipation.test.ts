import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, OpportunityCategory, PublishStatus, WalletType } from "@prisma/client";
import reservationResolver from "@/application/domain/reservation/controller/resolver";
import { GqlReservationCreateInput, GqlReservationPaymentMethod } from "@/types/graphql";

describe("Reservation Integration Tests", () => {
  jest.setTimeout(30_000);

  let startsAt: Date;
  let endsAt: Date;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    const now = new Date();
    startsAt = new Date(now.getTime() + 60 * 60 * 1000);
    endsAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  describe("reserve participation", () => {
    it("should create a member wallet if not existed", async () => {
      //////////////////////////////////////////////////
      // 1. insert seed data
      //////////////////////////////////////////////////
      const userInserted = await TestDataSourceHelper.createUser({
        name: "John Doe",
        slug: "user-1-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const userId = userInserted.id;
      const ctx = { currentUser: { id: userId } } as unknown as IContext;

      const communityName = `community-${crypto.randomUUID().slice(0, 6)}`;
      const pointName = `${communityName}-point`;

      const communityInserted = await TestDataSourceHelper.createCommunity({
        name: communityName,
        pointName,
        image: undefined,
        bio: undefined,
        website: undefined,
      });
      const communityId = communityInserted.id;

      const image = await TestDataSourceHelper.createImage({
        isPublic: true,
        url: "https://dummy.com/image.png",
        bucket: "string",
        folderPath: "string",
        filename: "string",
        mime: "string",
        ext: "string",
      });

      const opportunityInserted = await TestDataSourceHelper.createOpportunity({
        category: OpportunityCategory.EVENT,
        description: "opportunity",
        publishStatus: PublishStatus.PUBLIC,
        requireApproval: true,
        title: "opportunity",
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: userId } },
        images: { connect: { id: image.id } },
      });

      const slotInserted = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunityInserted.id } },
        startsAt,
        endsAt,
      });
      const slotId = slotInserted.id;

      //////////////////////////////////////////////////
      // 2. construct request & execute
      //////////////////////////////////////////////////
      const input: GqlReservationCreateInput = {
        opportunitySlotId: slotId,
        totalParticipantCount: 5,
        paymentMethod: GqlReservationPaymentMethod.Ticket,
      };

      await reservationResolver.Mutation.reservationCreate({}, { input }, ctx);

      //////////////////////////////////////////////////
      // 3. assert
      //////////////////////////////////////////////////
      // Reservationが作成される想定
      const reservationsActual = await TestDataSourceHelper.findAllReservations();
      expect(reservationsActual).toHaveLength(1);

      // member walletが無ければ新規作成
      const memberWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
      expect(memberWallet).toBeDefined();

      // wallet作成直後のポイントビュー未生成
      const memberCurrentPointActual = memberWallet?.currentPointView?.currentPoint;
      expect(memberCurrentPointActual).not.toBeDefined();
    });

    it("should not create a member wallet if existed", async () => {
      //////////////////////////////////////////////////
      // 1. insert seed data
      //////////////////////////////////////////////////
      const userInserted = await TestDataSourceHelper.createUser({
        name: "John Doe",
        slug: "user-1-slug",
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });
      const userId = userInserted.id;
      const ctx = { currentUser: { id: userId } } as unknown as IContext;

      const communityName = `community-${crypto.randomUUID().slice(0, 6)}`;
      const pointName = `${communityName}-point`;

      const communityInserted = await TestDataSourceHelper.createCommunity({
        name: communityName,
        pointName,
        image: undefined,
        bio: undefined,
        website: undefined,
      });
      const communityId = communityInserted.id;

      const image = await TestDataSourceHelper.createImage({
        isPublic: true,
        url: "https://dummy.com/image.png",
        bucket: "string",
        folderPath: "string",
        filename: "string",
        mime: "string",
        ext: "string",
      });

      const opportunityInserted = await TestDataSourceHelper.createOpportunity({
        category: OpportunityCategory.EVENT,
        description: "opportunity",
        publishStatus: PublishStatus.PUBLIC,
        requireApproval: true,
        title: "opportunity",
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: userId } },
        images: { connect: { id: image.id } },
      });

      // 既存 Member Wallet
      const existingWallet = await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: communityId } },
        user: { connect: { id: userId } },
      });
      const existingWalletId = existingWallet.id;

      const slotInserted = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunityInserted.id } },
        startsAt,
        endsAt,
      });
      const slotId = slotInserted.id;

      //////////////////////////////////////////////////
      // 2. construct request & execute
      //////////////////////////////////////////////////
      const input: GqlReservationCreateInput = {
        opportunitySlotId: slotId,
        totalParticipantCount: 5,
        paymentMethod: GqlReservationPaymentMethod.Ticket,
      };

      await reservationResolver.Mutation.reservationCreate({}, { input }, ctx);

      //////////////////////////////////////////////////
      // 3. assert
      //////////////////////////////////////////////////
      const reservationsActual = await TestDataSourceHelper.findAllReservations();
      expect(reservationsActual).toHaveLength(1);

      // 既存 Wallet が再利用される
      const memberWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
      expect(memberWallet?.id).toEqual(existingWalletId);
    });
  });
});
