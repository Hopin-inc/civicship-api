// import TestDataSourceHelper from "../../helper/test-data-source-helper";
// import { IContext } from "@/types/server";
// import {
//   CurrentPrefecture,
//   OpportunityCategory,
//   PublishStatus,
//   ReservationStatus,
//   WalletType,
// } from "@prisma/client";
// import reservationResolver from "@/application/domain/reservation/controller/resolver";
// import { GqlReservationCreateInput, GqlReservationPaymentMethod } from "@/types/graphql";
//
// describe("Reservation Integration Tests", () => {
//   beforeEach(async () => {
//     await TestDataSourceHelper.deleteAll();
//   });
//
//   afterAll(async () => {
//     await TestDataSourceHelper.disconnect();
//   });
//
//   const now = new Date();
//   const startsAt = new Date(now.getTime() + 60 * 60 * 1000);
//   const endsAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
//
//   describe("accept reservation application", () => {
//     it("should create a member wallet if not existed", async () => {
//       //////////////////////////////////////////////////
//       // 1. insert seed data
//       //////////////////////////////////////////////////
//       // 1-1. user
//       const userInserted = await TestDataSourceHelper.createUser({
//         name: "John Doe",
//         slug: "user-1-slug",
//         currentPrefecture: CurrentPrefecture.KAGAWA,
//       });
//       const userId = userInserted.id;
//       const ctx = { currentUser: { id: userId } } as unknown as IContext;
//
//       // 1-2. community
//       const communityInserted = await TestDataSourceHelper.createCommunity({
//         name: "community-1",
//         pointName: "community-1-point",
//       });
//       const communityId = communityInserted.id;
//
//       // 1-3. opportunity
//       const image = await TestDataSourceHelper.createImage({
//         isPublic: true,
//         url: "https://dummy.com/image.png",
//         bucket: "string",
//         folderPath: "string",
//         filename: "string",
//         mime: "string",
//         ext: "string",
//       });
//
//       const opportunityInserted = await TestDataSourceHelper.createOpportunity({
//         category: OpportunityCategory.EVENT,
//         description: "opportunity",
//         publishStatus: PublishStatus.PUBLIC,
//         requireApproval: true,
//         title: "opportunity",
//         community: { connect: { id: communityId } },
//         createdByUser: { connect: { id: userId } },
//         images: { connect: { id: image.id } },
//       });
//       const opportunityId = opportunityInserted.id;
//
//       // 1-4. opportunitySlot (予約対象の時間枠)
//       const slotInserted = await TestDataSourceHelper.createOpportunitySlot({
//         opportunity: { connect: { id: opportunityId } },
//         startsAt,
//         endsAt,
//       });
//       const slotId = slotInserted.id;
//
//       // 1-5. create "reservation" with status=INVITED
//       const reservationInserted = await TestDataSourceHelper.createReservation({
//         status: ReservationStatus.APPLIED,
//         opportunitySlot: { connect: { id: slotId } },
//         createdByUser: { connect: { id: userId } },
//       });
//       const reservationId = reservationInserted.id;
//
//       //////////////////////////////////////////////////
//       // 2. construct request (permission)
//       //////////////////////////////////////////////////
//       const permission = {
//         communityId,
//         opportunityId,
//       };
//
//       //////////////////////////////////////////////////
//       // 3. execute (call resolver)
//       //////////////////////////////////////////////////
//       // 旧: participationResolver.Mutation.participationAcceptApplication
//       // 新: reservationResolver.Mutation.reservationAcceptApplication (仮)
//       await reservationResolver.Mutation.reservationAccept(
//         {},
//         {
//           id: reservationId,
//           permission,
//         },
//         ctx,
//       );
//
//       //////////////////////////////////////////////////
//       // 4. assert
//       //////////////////////////////////////////////////
//       const reservationActual = await TestDataSourceHelper.findReservationById(reservationId);
//
//       // APPLIED → ACCEPTED (または PARTICIPATING 等、実際の仕様に合わせて)
//       expect(reservationActual?.status).toEqual(ReservationStatus.ACCEPTED);
//
//       // member wallet が新規作成されていること
//       const memberWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
//       expect(memberWallet).toBeDefined();
//
//       // wallet 作成直後は mv_current_points が未生成かチェック (任意)
//       const memberCurrentPointActual = memberWallet?.currentPointView?.currentPoint;
//       expect(memberCurrentPointActual).not.toBeDefined();
//     });
//
//     it("should not create a member wallet if existed", async () => {
//       //////////////////////////////////////////////////
//       // 1. insert seed data
//       //////////////////////////////////////////////////
//       const userInserted = await TestDataSourceHelper.createUser({
//         name: "John Doe",
//         slug: "user-1-slug",
//         currentPrefecture: CurrentPrefecture.KAGAWA,
//       });
//       const userId = userInserted.id;
//       const ctx = { currentUser: { id: userId } } as unknown as IContext;
//
//       const communityInserted = await TestDataSourceHelper.createCommunity({
//         name: "community-1",
//         pointName: "community-1-point",
//       });
//       const communityId = communityInserted.id;
//
//       const image = await TestDataSourceHelper.createImage({
//         isPublic: true,
//         url: "https://dummy.com/image.png",
//         bucket: "string",
//         folderPath: "string",
//         filename: "string",
//         mime: "string",
//         ext: "string",
//       });
//
//       const opportunityInserted = await TestDataSourceHelper.createOpportunity({
//         category: OpportunityCategory.EVENT,
//         description: "opportunity",
//         publishStatus: PublishStatus.PUBLIC,
//         requireApproval: true,
//         title: "opportunity",
//         community: { connect: { id: communityId } },
//         createdByUser: { connect: { id: userId } },
//         images: { connect: { id: image.id } },
//       });
//       const opportunityId = opportunityInserted.id;
//
//       const slotInserted = await TestDataSourceHelper.createOpportunitySlot({
//         opportunity: { connect: { id: opportunityId } },
//         startsAt,
//         endsAt,
//       });
//
//       const reservationInserted = await TestDataSourceHelper.createReservation({
//         status: ReservationStatus.APPLIED,
//         opportunitySlot: { connect: { id: slotInserted.id } },
//         createdByUser: { connect: { id: userId } },
//       });
//       const reservationId = reservationInserted.id;
//
//       // 既存 memberWallet を作成
//       const existingWallet = await TestDataSourceHelper.createWallet({
//         type: WalletType.MEMBER,
//         community: { connect: { id: communityId } },
//         user: { connect: { id: userId } },
//       });
//       const existingWalletId = existingWallet.id;
//
//       //////////////////////////////////////////////////
//       // 2. construct request (input)
//       //////////////////////////////////////////////////
//       const permission = { communityId, opportunityId };
//
//       //////////////////////////////////////////////////
//       // 3. execute
//       //////////////////////////////////////////////////
//       await reservationResolver.Mutation.reservationAccept(
//         {},
//         {
//           id: reservationId,
//           permission,
//         },
//         ctx,
//       );
//
//       //////////////////////////////////////////////////
//       // 4. assert
//       //////////////////////////////////////////////////
//       const reservationActual = await TestDataSourceHelper.findReservationById(reservationId);
//       expect(reservationActual?.status).toEqual(ReservationStatus.ACCEPTED);
//
//       // 既存のmember walletがそのまま使われること
//       const memberWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
//       expect(memberWallet?.id).toEqual(existingWalletId);
//     });
//   });
//
//   describe("apply for opportunity", () => {
//     it("should create a member wallet if not existed", async () => {
//       //////////////////////////////////////////////////
//       // 1. insert seed data
//       //////////////////////////////////////////////////
//       const userInserted = await TestDataSourceHelper.createUser({
//         name: "John Doe",
//         slug: "user-1-slug",
//         currentPrefecture: CurrentPrefecture.KAGAWA,
//       });
//       const userId = userInserted.id;
//       const ctx = { currentUser: { id: userId } } as unknown as IContext;
//
//       const communityInserted = await TestDataSourceHelper.createCommunity({
//         name: "community-1",
//         pointName: "community-1-point",
//         image: undefined,
//         bio: undefined,
//         website: undefined,
//       });
//       const communityId = communityInserted.id;
//
//       const image = await TestDataSourceHelper.createImage({
//         isPublic: true,
//         url: "https://dummy.com/image.png",
//         bucket: "string",
//         folderPath: "string",
//         filename: "string",
//         mime: "string",
//         ext: "string",
//       });
//
//       const opportunityInserted = await TestDataSourceHelper.createOpportunity({
//         category: OpportunityCategory.EVENT,
//         description: "opportunity",
//         publishStatus: PublishStatus.PUBLIC,
//         requireApproval: true,
//         title: "opportunity",
//         community: { connect: { id: communityId } },
//         createdByUser: { connect: { id: userId } },
//         images: { connect: { id: image.id } },
//       });
//
//       const slotInserted = await TestDataSourceHelper.createOpportunitySlot({
//         opportunity: { connect: { id: opportunityInserted.id } },
//         startsAt,
//         endsAt,
//       });
//       const slotId = slotInserted.id;
//
//       //////////////////////////////////////////////////
//       // 2. construct request & execute
//       //////////////////////////////////////////////////
//       const input: GqlReservationCreateInput = {
//         opportunitySlotId: slotId,
//         totalParticipantCount: 5,
//         paymentMethod: GqlReservationPaymentMethod.Ticket,
//       };
//
//       await reservationResolver.Mutation.reservationCreate({}, { input }, ctx);
//
//       //////////////////////////////////////////////////
//       // 3. assert
//       //////////////////////////////////////////////////
//       // Reservationが作成される想定
//       const reservationsActual = await TestDataSourceHelper.findAllReservations();
//       expect(reservationsActual).toHaveLength(1);
//
//       // member walletが無ければ新規作成
//       const memberWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
//       expect(memberWallet).toBeDefined();
//
//       // wallet作成直後のポイントビュー未生成
//       const memberCurrentPointActual = memberWallet?.currentPointView?.currentPoint;
//       expect(memberCurrentPointActual).not.toBeDefined();
//     });
//
//     it("should not create a member wallet if existed", async () => {
//       //////////////////////////////////////////////////
//       // 1. insert seed data
//       //////////////////////////////////////////////////
//       const userInserted = await TestDataSourceHelper.createUser({
//         name: "John Doe",
//         slug: "user-1-slug",
//         currentPrefecture: CurrentPrefecture.KAGAWA,
//       });
//       const userId = userInserted.id;
//       const ctx = { currentUser: { id: userId } } as unknown as IContext;
//
//       const communityInserted = await TestDataSourceHelper.createCommunity({
//         name: "community-1",
//         pointName: "community-1-point",
//         image: undefined,
//         bio: undefined,
//         website: undefined,
//       });
//       const communityId = communityInserted.id;
//
//       const image = await TestDataSourceHelper.createImage({
//         isPublic: true,
//         url: "https://dummy.com/image.png",
//         bucket: "string",
//         folderPath: "string",
//         filename: "string",
//         mime: "string",
//         ext: "string",
//       });
//
//       const opportunityInserted = await TestDataSourceHelper.createOpportunity({
//         category: OpportunityCategory.EVENT,
//         description: "opportunity",
//         publishStatus: PublishStatus.PUBLIC,
//         requireApproval: true,
//         title: "opportunity",
//         community: { connect: { id: communityId } },
//         createdByUser: { connect: { id: userId } },
//         images: { connect: { id: image.id } },
//       });
//
//       // 既存 Member Wallet
//       const existingWallet = await TestDataSourceHelper.createWallet({
//         type: WalletType.MEMBER,
//         community: { connect: { id: communityId } },
//         user: { connect: { id: userId } },
//       });
//       const existingWalletId = existingWallet.id;
//
//       const slotInserted = await TestDataSourceHelper.createOpportunitySlot({
//         opportunity: { connect: { id: opportunityInserted.id } },
//         startsAt,
//         endsAt,
//       });
//       const slotId = slotInserted.id;
//
//       //////////////////////////////////////////////////
//       // 2. construct request & execute
//       //////////////////////////////////////////////////
//       const input: GqlReservationCreateInput = {
//         opportunitySlotId: slotId,
//         totalParticipantCount: 5,
//         paymentMethod: GqlReservationPaymentMethod.Ticket,
//       };
//
//       await reservationResolver.Mutation.reservationCreate({}, { input }, ctx);
//
//       //////////////////////////////////////////////////
//       // 3. assert
//       //////////////////////////////////////////////////
//       const reservationsActual = await TestDataSourceHelper.findAllReservations();
//       expect(reservationsActual).toHaveLength(1);
//
//       // 既存 Wallet が再利用される
//       const memberWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
//       expect(memberWallet?.id).toEqual(existingWalletId);
//     });
//   });
// });
