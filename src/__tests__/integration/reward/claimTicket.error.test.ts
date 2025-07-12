import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TicketStatus } from "@prisma/client";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Ticket UseCase Business Logic Error Tests", () => {
  let useCase: TicketUseCase;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();
    useCase = container.resolve(TicketUseCase);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should fail to claim non-existent ticket", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.userClaimTicket({
        input: { ticketId: "non-existent-ticket-id" },
        permission: { userId: user.id }
      }, ctx)
    ).rejects.toThrow(/not found|ticket.*not.*found/i);
  });

  it("should fail to claim already claimed ticket", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const utility = await TestDataSourceHelper.createUtility({
      name: "Test Utility",
      description: "Test description",
      pointsRequired: 100,
      community: { connect: { id: community.id } },
    });

    const ticket = await TestDataSourceHelper.createTicket({
      utility: { connect: { id: utility.id } },
      user: { connect: { id: user.id } },
      status: TicketStatus.CLAIMED,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.userClaimTicket({
        input: { ticketId: ticket.id },
        permission: { userId: user.id }
      }, ctx)
    ).rejects.toThrow(/already.*claimed|ticket.*claimed/i);
  });

  it("should fail to claim expired ticket", async () => {
    const user = await TestDataSourceHelper.createUser({
      name: "Test User",
      slug: "test-user",
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const community = await TestDataSourceHelper.createCommunity({
      name: "Test Community",
      pointName: "test-points",
    });

    const utility = await TestDataSourceHelper.createUtility({
      name: "Test Utility",
      description: "Test description",
      pointsRequired: 100,
      community: { connect: { id: community.id } },
    });

    const ticket = await TestDataSourceHelper.createTicket({
      utility: { connect: { id: utility.id } },
      user: { connect: { id: user.id } },
      status: TicketStatus.EXPIRED,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as IContext;

    await expect(
      useCase.userClaimTicket({
        input: { ticketId: ticket.id },
        permission: { userId: user.id }
      }, ctx)
    ).rejects.toThrow(/expired|ticket.*expired/i);
  });
});
