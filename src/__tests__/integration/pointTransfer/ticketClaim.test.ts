import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import {
  CurrentPrefecture,
  MembershipStatus,
  MembershipStatusReason,
  Role,
  TransactionReason,
  WalletType,
} from "@prisma/client";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Ticket Claim Tests", () => {
  const testSetup = {
    userName: "Jane Doe",
    slug: "user-2-slug",
    communityName: "community-2",
    pointName: "community-2-point",
    pointsRequired: 50,
    qtyToBeIssued: 2,
    comment: "テスト用チケット",
  };

  const transferPoints = testSetup.pointsRequired * testSetup.qtyToBeIssued;

  let ctx: IContext;
  let useCase: TicketUseCase;
  let issuer: PrismaClientIssuer;
  let ticketClaimLinkId: string;
  let ownerWalletId: string;
  let memberWalletId: string;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();
    registerProductionDependencies();

    useCase = container.resolve(TicketUseCase);
    issuer = container.resolve(PrismaClientIssuer);

    ({ ctx, ticketClaimLinkId, ownerWalletId, memberWalletId } = await setupClaimContext({
      withPoints: true,
    }));
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  const setupClaimContext = async ({ withPoints }: { withPoints: boolean }) => {
    const user = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx = { currentUser: { id: user.id }, issuer } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: testSetup.communityName,
      pointName: testSetup.pointName,
    });

    const owner = await TestDataSourceHelper.createUser({
      name: "Ticket Owner",
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const [memberWallet, ownerWallet] = await Promise.all([
      TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: user.id } },
      }),
      TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        community: { connect: { id: community.id } },
        user: { connect: { id: owner.id } },
      }),
    ]);

    const utility = await TestDataSourceHelper.createUtility({
      name: "Test Utility",
      pointsRequired: testSetup.pointsRequired,
      community: { connect: { id: community.id } },
    });

    // 1. issuer を先に作る
    const ticketIssuer = await TestDataSourceHelper.createTicketIssuer({
      utility: { connect: { id: utility.id } },
      owner: { connect: { id: owner.id } },
      qtyToBeIssued: testSetup.qtyToBeIssued,
    });

    // 2. claimLink を作成（issuer に紐付け）
    const claimLink = await TestDataSourceHelper.createTicketClaimLink({
      issuer: { connect: { id: ticketIssuer.id } },
    });

    // 3. issuer に claimLink を明示的に update（逆側のフィールド）
    await TestDataSourceHelper.linkClaimToIssuer(ticketIssuer.id, claimLink.id);

    if (withPoints) {
      await TestDataSourceHelper.createTransaction({
        toWallet: { connect: { id: ownerWallet.id } },
        toPointChange: transferPoints,
        fromPointChange: transferPoints,
        reason: TransactionReason.GRANT,
      });
    }

    await Promise.all([
      TestDataSourceHelper.createMembership({
        user: { connect: { id: user.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        role: Role.MEMBER,
        reason: MembershipStatusReason.INVITED,
      }),
      TestDataSourceHelper.createMembership({
        user: { connect: { id: owner.id } },
        community: { connect: { id: community.id } },
        status: MembershipStatus.JOINED,
        role: Role.MEMBER,
        reason: MembershipStatusReason.ASSIGNED,
      }),
    ]);

    await TestDataSourceHelper.refreshCurrentPoints();

    return {
      ctx,
      userId: user.id,
      communityId: community.id,
      ticketClaimLinkId: claimLink.id,
      ownerWalletId: ownerWallet.id,
      memberWalletId: memberWallet.id,
    };
  };

  it("should claim ticket successfully", async () => {
    const result = await useCase.userClaimTicket(ctx, { ticketClaimLinkId });
    expect(result.tickets.length).toBe(testSetup.qtyToBeIssued);
  });

  it("should transfer points correctly between owner and claimer", async () => {
    await useCase.userClaimTicket(ctx, { ticketClaimLinkId });
    const tx = await TestDataSourceHelper.findAllTransactions();
    const donateTx = tx.find((t) => t.reason === TransactionReason.DONATION);
    expect(donateTx).toMatchObject({
      from: ownerWalletId,
      to: memberWalletId,
      fromPointChange: transferPoints,
      toPointChange: transferPoints,
    });
  });

  it("should refresh currentPointView after claim", async () => {
    await useCase.userClaimTicket(ctx, { ticketClaimLinkId });
    await TestDataSourceHelper.refreshCurrentPoints();
    const [owner, member] = await Promise.all([
      TestDataSourceHelper.findWallet(ownerWalletId),
      TestDataSourceHelper.findWallet(memberWalletId),
    ]);
    expect(owner?.currentPointView?.currentPoint).toBe(transferPoints);
    expect(member?.currentPointView?.currentPoint).toBe(0);
  });

  it("should fail if owner wallet has insufficient points", async () => {
    ({ ctx, ticketClaimLinkId } = await setupClaimContext({ withPoints: false }));
    await expect(useCase.userClaimTicket(ctx, { ticketClaimLinkId })).rejects.toThrow(
      /insufficient/i,
    );
  });

  it("should not allow claiming the same ticket twice", async () => {
    await useCase.userClaimTicket(ctx, { ticketClaimLinkId });
    await expect(useCase.userClaimTicket(ctx, { ticketClaimLinkId })).rejects.toThrow(
      /already been used/i,
    );
  });

  it("should fail when claimLinkId is invalid", async () => {
    await expect(
      useCase.userClaimTicket(ctx, { ticketClaimLinkId: "non-existent-id" }),
    ).rejects.toThrow(/not found/i);
  });

  it("should auto-join community if not a member", async () => {
    await TestDataSourceHelper.deleteAll();
    ({ ctx, ticketClaimLinkId } = await setupClaimContext({ withPoints: true }));
    const result = await useCase.userClaimTicket(ctx, { ticketClaimLinkId });
    expect(result.tickets.length).toBe(testSetup.qtyToBeIssued);
  });
});
