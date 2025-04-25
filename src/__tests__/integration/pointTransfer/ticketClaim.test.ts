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
import ticketResolver from "@/application/domain/reward/ticket/controller/resolver";

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
  let userId: string;
  let communityId: string;
  let ownerWalletId: string;
  let memberWalletId: string;
  let ticketClaimLinkId: string;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();

    const user = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    userId = user.id;
    ctx = { currentUser: { id: userId } } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: testSetup.communityName,
      pointName: testSetup.pointName,
    });
    communityId = community.id;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: userId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MEMBER,
      reason: MembershipStatusReason.INVITED,
    });

    const owner = await TestDataSourceHelper.createUser({
      name: "Ticket Owner",
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: owner.id } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MEMBER,
      reason: MembershipStatusReason.ASSIGNED,
    });

    const utility = await TestDataSourceHelper.createUtility({
      name: "Test Utility",
      pointsRequired: testSetup.pointsRequired,
      community: { connect: { id: communityId } },
    });

    const issuer = await TestDataSourceHelper.createTicketIssuer({
      utility: { connect: { id: utility.id } },
      owner: { connect: { id: owner.id } },
      qtyToBeIssued: testSetup.qtyToBeIssued,
    });

    const claimLink = await TestDataSourceHelper.createTicketClaimLink({
      issuer: { connect: { id: issuer.id } },
    });
    ticketClaimLinkId = claimLink.id;

    const ownerWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: owner.id } },
    });
    ownerWalletId = ownerWallet.id;

    const memberWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
    });
    memberWalletId = memberWallet.id;

    // オーナーにポイントを付与しておく
    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: ownerWalletId } },
      toPointChange: transferPoints,
      fromPointChange: transferPoints,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should claim ticket successfully", async () => {
    const result = await ticketResolver.Mutation.ticketClaim(
      {},
      { input: { ticketClaimLinkId } },
      ctx,
    );

    expect(result.tickets.length).toBe(testSetup.qtyToBeIssued);

    const tx = await TestDataSourceHelper.findAllTransactions();
    const donateTx = tx.find((t) => t.reason === TransactionReason.DONATION);
    const purchaseTx = tx.find((t) => t.reason === TransactionReason.TICKET_PURCHASED);

    expect(donateTx).toBeDefined();
    expect(purchaseTx).toBeDefined();
  });

  it("should transfer points correctly between owner and claimer", async () => {
    await ticketResolver.Mutation.ticketClaim({}, { input: { ticketClaimLinkId } }, ctx);

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.DONATION,
    );

    expect(tx?.from).toBe(ownerWalletId);
    expect(tx?.to).toBe(memberWalletId);
    expect(tx?.fromPointChange).toBe(transferPoints);
    expect(tx?.toPointChange).toBe(transferPoints);
  });

  it("should refresh currentPointView after claim", async () => {
    await ticketResolver.Mutation.ticketClaim({}, { input: { ticketClaimLinkId } }, ctx);

    await TestDataSourceHelper.refreshCurrentPoints();

    const ownerPoint = (await TestDataSourceHelper.findWallet(ownerWalletId))?.currentPointView
      ?.currentPoint;
    const memberPoint = (await TestDataSourceHelper.findWallet(memberWalletId))?.currentPointView
      ?.currentPoint;

    expect(ownerPoint).toBe(transferPoints);
    expect(memberPoint).toBe(0);
  });

  it("should fail if owner wallet has insufficient points", async () => {
    // オーナーの残高を 0 に調整（ポイント付与なし）
    await TestDataSourceHelper.deleteAll();

    const user = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    userId = user.id;
    ctx = { currentUser: { id: userId } } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: testSetup.communityName,
      pointName: testSetup.pointName,
    });
    communityId = community.id;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: userId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MEMBER,
      reason: MembershipStatusReason.INVITED,
    });

    const owner = await TestDataSourceHelper.createUser({
      name: "Ticket Owner",
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: owner.id } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MEMBER,
      reason: MembershipStatusReason.ASSIGNED,
    });

    const utility = await TestDataSourceHelper.createUtility({
      name: "Test Utility",
      pointsRequired: testSetup.pointsRequired,
      community: { connect: { id: communityId } },
    });

    const issuer = await TestDataSourceHelper.createTicketIssuer({
      utility: { connect: { id: utility.id } },
      owner: { connect: { id: owner.id } },
      qtyToBeIssued: testSetup.qtyToBeIssued,
    });

    const claimLink = await TestDataSourceHelper.createTicketClaimLink({
      issuer: { connect: { id: issuer.id } },
    });
    ticketClaimLinkId = claimLink.id;

    await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: owner.id } },
    });

    await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    await expect(
      ticketResolver.Mutation.ticketClaim({}, { input: { ticketClaimLinkId } }, ctx),
    ).rejects.toThrow(/insufficient/i);
  });

  it("should not allow claiming the same ticket twice", async () => {
    await ticketResolver.Mutation.ticketClaim({}, { input: { ticketClaimLinkId } }, ctx);

    await expect(
      ticketResolver.Mutation.ticketClaim({}, { input: { ticketClaimLinkId } }, ctx),
    ).rejects.toThrow(/already been used/i);
  });

  it("should fail when claimLinkId is invalid", async () => {
    const invalidId = "non-existent-id";

    await expect(
      ticketResolver.Mutation.ticketClaim({}, { input: { ticketClaimLinkId: invalidId } }, ctx),
    ).rejects.toThrow(/not found/i);
  });

  it("should auto-join community if not a member", async () => {
    // Membership を事前に作成せず検証
    await TestDataSourceHelper.deleteAll();

    const user = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    userId = user.id;
    ctx = { currentUser: { id: userId } } as unknown as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: testSetup.communityName,
      pointName: testSetup.pointName,
    });
    communityId = community.id;

    const owner = await TestDataSourceHelper.createUser({
      name: "Ticket Owner",
      slug: testSetup.slug,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: owner.id } },
      community: { connect: { id: community.id } },
      status: MembershipStatus.JOINED,
      role: Role.MEMBER,
      reason: MembershipStatusReason.ASSIGNED,
    });

    const utility = await TestDataSourceHelper.createUtility({
      name: "Test Utility",
      pointsRequired: testSetup.pointsRequired,
      community: { connect: { id: communityId } },
    });

    const issuer = await TestDataSourceHelper.createTicketIssuer({
      utility: { connect: { id: utility.id } },
      owner: { connect: { id: owner.id } },
      qtyToBeIssued: testSetup.qtyToBeIssued,
    });

    const claimLink = await TestDataSourceHelper.createTicketClaimLink({
      issuer: { connect: { id: issuer.id } },
    });
    ticketClaimLinkId = claimLink.id;

    const ownerWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: owner.id } },
    });
    ownerWalletId = ownerWallet.id;

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: ownerWalletId } },
      toPointChange: transferPoints,
      fromPointChange: transferPoints,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: userId } },
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const result = await ticketResolver.Mutation.ticketClaim(
      {},
      { input: { ticketClaimLinkId } },
      ctx,
    );

    expect(result.tickets.length).toBe(2);
  });
});
