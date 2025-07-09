import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import {
  CurrentPrefecture,
  IdentityPlatform,
  MembershipStatus,
  MembershipStatusReason,
  OpportunityCategory,
  ParticipationStatus,
  ParticipationStatusReason,
  PublishStatus,
  Role,
  TransactionReason,
  WalletType,
} from "@prisma/client";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";
import { GqlEvaluationStatus } from "@/types/graphql";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";

describe("Point Reward and VC Issuance Tests", () => {
  const testSetup = {
    userName: "Jane Doe",
    slug: "user-2-slug",
    communityName: "community-2",
    pointName: "community-2-point",
    pointsToEarn: 100,
    communityInitialPoint: 101,
    comment: "テスト評価",
  };

  let ctx: IContext;
  let useCase: EvaluationUseCase;
  let opportunityOwnerUserId: string;
  let communityId: string;
  let communityWalletId: string;
  let participationWalletId: string;
  let participationId: string;
  let opportunityOwnerWalletId: string;
  let participationUserId: string;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    container.reset();
    registerProductionDependencies();

    mockDIDVCClient = { call: jest.fn() } as any;

    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });
    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });
    
    useCase = container.resolve(EvaluationUseCase);

    const opportunityOwnerUserInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: `${testSetup.slug}-owner-${uniqueId}`,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    opportunityOwnerUserId = opportunityOwnerUserInserted.id;
    ctx = {
      currentUser: { id: opportunityOwnerUserId },
      issuer: container.resolve("PrismaClientIssuer"),
    } as unknown as IContext;
    
    const participationUserInserted = await TestDataSourceHelper.createUser({
      name: testSetup.userName,
      slug: `${testSetup.slug}-participation-${uniqueId}`,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });
    participationUserId = participationUserInserted.id;

    await TestDataSourceHelper.createIdentity({
      uid: `test-phone-uid-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      authToken: "test-phone-auth-token",
      refreshToken: "test-phone-refresh-token",
      tokenExpiresAt: new Date(Date.now() + 3600000),
      user: { connect: { id: participationUserId } },
    });

    await TestDataSourceHelper.createDIDIssuanceRequest({
      user: { connect: { id: participationUserId } },
      status: "COMPLETED",
      didValue: `did:prism:test-did-${uniqueId}`,
      jobId: `test-did-job-${uniqueId}`,
      processedAt: new Date(),
      retryCount: 0,
    });

    const communityInserted = await TestDataSourceHelper.createCommunity({
      name: `${testSetup.communityName}-${uniqueId}`,
      pointName: `${testSetup.pointName}-${uniqueId}`,
      image: undefined,
      bio: undefined,
      establishedAt: undefined,
      website: undefined,
    });
    communityId = communityInserted.id;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: opportunityOwnerUserId } },
      community: { connect: { id: communityId } },
      status: MembershipStatus.JOINED,
      role: Role.MANAGER,
      reason: MembershipStatusReason.ASSIGNED,
    });

    const communityWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: communityId } },
    });
    communityWalletId = communityWallet.id;

    const participationWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: participationUserId } },
    });
    participationWalletId = participationWallet.id;

    const opportunityOwnerWallet = await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: opportunityOwnerUserId } },
    });
    opportunityOwnerWalletId = opportunityOwnerWallet.id;

    const opportunity = await TestDataSourceHelper.createOpportunity({
      category: OpportunityCategory.QUEST,
      description: "opportunity",
      publishStatus: PublishStatus.PUBLIC,
      requireApproval: true,
      title: "opportunity",
      pointsToEarn: testSetup.pointsToEarn,
      community: { connect: { id: communityId } },
      createdByUser: { connect: { id: opportunityOwnerUserId } },
    });

    const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
      opportunity: { connect: { id: opportunity.id } },
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const reservation = await TestDataSourceHelper.createReservation({
      opportunitySlot: { connect: { id: opportunitySlot.id } },
      createdByUser: { connect: { id: opportunityOwnerUserId } },
    });

    const participation = await TestDataSourceHelper.createParticipation({
      status: ParticipationStatus.PENDING,
      reason: ParticipationStatusReason.RESERVATION_APPLIED,
      community: { connect: { id: communityId } },
      user: { connect: { id: participationUserId } },
      reservation: { connect: { id: reservation.id } },
    });
    participationId = participation.id;

    await TestDataSourceHelper.createTransaction({
      toWallet: { connect: { id: communityWalletId } },
      toPointChange: testSetup.communityInitialPoint,
      fromPointChange: testSetup.communityInitialPoint,
      reason: TransactionReason.POINT_ISSUED,
    });

    await TestDataSourceHelper.createTransaction({
      fromWallet: { connect: { id: communityWalletId } },
      toWallet: { connect: { id: opportunityOwnerWalletId } },
      toPointChange: testSetup.communityInitialPoint,
      fromPointChange: testSetup.communityInitialPoint,
      reason: TransactionReason.GRANT,
    });

    await TestDataSourceHelper.refreshCurrentPoints();
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
    await container.resolve<PrismaClientIssuer>("PrismaClientIssuer").disconnect();
  });

  it("creates POINT_REWARD transaction on bulk evaluation", async () => {
    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });

    await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: {
          communityId,
        },
      },
      ctx,
    );

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transaction = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
    expect(transaction).toBeDefined();
  });

  it("transfers points from opportunityOwner to participation wallet on bulk evaluation", async () => {
    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });

    await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    const tx = (await TestDataSourceHelper.findAllTransactions()).find(
      (t) => t.reason === TransactionReason.POINT_REWARD,
    );

    expect(tx?.from).toEqual(opportunityOwnerWalletId);
    expect(tx?.to).toEqual(participationWalletId);
    expect(tx?.fromPointChange).toEqual(testSetup.pointsToEarn);
    expect(tx?.toPointChange).toEqual(testSetup.pointsToEarn);
  });

  it("updates currentPointView after bulk evaluation", async () => {
    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-job-id" });

    await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    await TestDataSourceHelper.refreshCurrentPoints();

    const participationPoint = (
      await TestDataSourceHelper.findMemberWallet(participationUserId, communityId)
    )?.currentPointView?.currentPoint;
    expect(participationPoint).toBe(BigInt(testSetup.pointsToEarn));

    const opportunityOwnerPoint = (
      await TestDataSourceHelper.findMemberWallet(opportunityOwnerUserId, communityId)
    )?.currentPointView?.currentPoint;
    const expectedOwnerPoint = BigInt(testSetup.communityInitialPoint - testSetup.pointsToEarn);
    expect(opportunityOwnerPoint).toBe(expectedOwnerPoint);

    const communityPoint = (await TestDataSourceHelper.findCommunityWallet(communityId))
      ?.currentPointView?.currentPoint;
    const expectedCommunityPoint = BigInt(0);
    expect(communityPoint).toBe(expectedCommunityPoint);
  });

  it("should complete evaluation successfully even when VC external API fails", async () => {
    mockDIDVCClient.call.mockResolvedValue(null);

    const result = await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    const evaluationId = result.evaluations[0].id;

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transaction = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
    expect(transaction).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(evaluationId);
    expect(vcRequest).toBeDefined();
    expect(vcRequest?.status).toBe("PENDING");
    expect(vcRequest?.errorMessage).toBe("External API call failed");
    expect(vcRequest?.retryCount).toBe(1);
    expect(vcRequest?.jobId).toBeNull();

    expect(mockDIDVCClient.call).toHaveBeenCalledWith(
      expect.stringMatching(/test-phone-uid-/),
      "test-phone-auth-token",
      "/vc/jobs/connectionless/issue-to-holder",
      "POST",
      expect.objectContaining({
        claims: expect.any(Object),
        credentialFormat: expect.any(String),
        schemaId: undefined,
      })
    );
  });

  it("should handle VC external API timeout gracefully", async () => {
    mockDIDVCClient.call.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(null), 100);
      });
    });

    const result = await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    const evaluationId = result.evaluations[0].id;

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transaction = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
    expect(transaction).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 1200));

    const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(evaluationId);
    expect(vcRequest).toBeDefined();
    expect(vcRequest?.status).toBe("PENDING");
    expect(vcRequest?.errorMessage).toBe("External API call failed");
    expect(vcRequest?.retryCount).toBe(1);
    expect(vcRequest?.jobId).toBeNull();
  });

  it("should handle successful VC issuance when external API succeeds", async () => {
    mockDIDVCClient.call.mockResolvedValue({ jobId: "test-vc-job-id" });

    const result = await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    const evaluationId = result.evaluations[0].id;

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transaction = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
    expect(transaction).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 1000));

    const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(evaluationId);
    expect(vcRequest).toBeDefined();
    expect(vcRequest?.status).toBe("PROCESSING");
    expect(vcRequest?.jobId).toBe("test-vc-job-id");
    expect(vcRequest?.errorMessage).toBeNull();
    expect(vcRequest?.retryCount).toBe(0);

    expect(mockDIDVCClient.call).toHaveBeenCalledWith(
      expect.stringMatching(/test-phone-uid-/),
      "test-phone-auth-token",
      "/vc/jobs/connectionless/issue-to-holder",
      "POST",
      expect.objectContaining({
        claims: expect.any(Object),
        credentialFormat: expect.any(String),
        schemaId: undefined,
      })
    );
  });

  it("should handle multiple external API failures simultaneously", async () => {
    mockDIDVCClient.call.mockResolvedValue(null);

    const result = await useCase.managerBulkCreateEvaluations(
      {
        input: {
          evaluations: [
            {
              participationId,
              comment: testSetup.comment,
              status: GqlEvaluationStatus.Passed,
            },
          ],
        },
        permission: { communityId },
      },
      ctx,
    );

    const evaluationId = result.evaluations[0].id;

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transaction = transactions.find((t) => t.reason === TransactionReason.POINT_REWARD);
    expect(transaction).toBeDefined();
    expect(transaction?.from).toEqual(opportunityOwnerWalletId);
    expect(transaction?.to).toEqual(participationWalletId);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(evaluationId);
    expect(vcRequest).toBeDefined();
    expect(vcRequest?.status).toBe("PENDING");
    expect(vcRequest?.errorMessage).toBe("External API call failed");
    expect(vcRequest?.retryCount).toBe(1);
    expect(vcRequest?.jobId).toBeNull();

    expect(mockDIDVCClient.call).toHaveBeenCalledTimes(1);
  });
});
