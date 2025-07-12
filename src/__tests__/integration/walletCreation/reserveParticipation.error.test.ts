import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, OpportunityCategory, PublishStatus } from "@prisma/client";
import { GqlReservationCreateInput, GqlReservationPaymentMethod } from "@/types/graphql";
import ReservationUseCase from "@/application/domain/experience/reservation/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Reservation Error Handling Tests", () => {
  let useCase: ReservationUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(ReservationUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to reserve with invalid opportunity slot", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlReservationCreateInput = {
      opportunitySlotId: "non-existent-slot-id",
      totalParticipantCount: 1,
      paymentMethod: GqlReservationPaymentMethod.Ticket,
    };

    await expect(
      useCase.userReserveParticipation({ input }, ctx)
    ).rejects.toThrow(/not found|invalid.*slot/i);
  });

  it("should fail to reserve with zero participants", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const opportunity = await TestDataSourceHelper.createOpportunity({
      category: OpportunityCategory.EVENT,
      description: "Test Opportunity",
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: false,
      title: "Test Event",
      community: { connect: { id: community.id } },
      createdByUser: { connect: { id: user.id } },
    });

    const slot = await TestDataSourceHelper.createOpportunitySlot({
      opportunity: { connect: { id: opportunity.id } },
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
      capacity: 5,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlReservationCreateInput = {
      opportunitySlotId: slot.id,
      totalParticipantCount: 0,
      paymentMethod: GqlReservationPaymentMethod.Ticket,
    };

    await expect(
      useCase.userReserveParticipation({ input }, ctx)
    ).rejects.toThrow(/participant.*count|zero.*participants/i);
  });

  it("should fail to reserve when capacity is exceeded", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const opportunity = await TestDataSourceHelper.createOpportunity({
      category: OpportunityCategory.EVENT,
      description: "Test Opportunity",
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: false,
      title: "Test Event",
      community: { connect: { id: community.id } },
      createdByUser: { connect: { id: user.id } },
    });

    const slot = await TestDataSourceHelper.createOpportunitySlot({
      opportunity: { connect: { id: opportunity.id } },
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
      capacity: 2,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    const input: GqlReservationCreateInput = {
      opportunitySlotId: slot.id,
      totalParticipantCount: 5, // Exceeds capacity of 2
      paymentMethod: GqlReservationPaymentMethod.Ticket,
    };

    await expect(
      useCase.userReserveParticipation({ input }, ctx)
    ).rejects.toThrow(/capacity.*exceeded|insufficient.*capacity/i);
  });

  it("should fail when user is not authenticated", async () => {
    const ctx = { issuer } as IContext; // No currentUser

    const input: GqlReservationCreateInput = {
      opportunitySlotId: "test-slot-id",
      totalParticipantCount: 1,
      paymentMethod: GqlReservationPaymentMethod.Ticket,
    };

    await expect(
      useCase.userReserveParticipation({ input }, ctx)
    ).rejects.toThrow(/authentication|logged.*in/i);
  });
});
