import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import {
  CurrentPrefecture,
  IdentityPlatform,
  WalletType,
} from "@prisma/client";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";
import { GqlEvaluationStatus } from "@/types/graphql";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { DIDVCServerClient } from "@/infrastructure/libs/did";

interface ParticipationData {
  participation: any;
  userId: string;
}

describe("Concurrent Evaluation Integration Tests", () => {
  let ctx: IContext;
  let useCase: EvaluationUseCase;
  let communityId: string;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    mockDIDVCClient = { call: jest.fn() } as any;

    registerProductionDependencies();
    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });
    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });

    useCase = container.resolve(EvaluationUseCase);

    const opportunityOwnerUser = await TestDataSourceHelper.createUser({
      name: "Concurrent Owner",
      slug: `concurrent-owner-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    ctx = {
      currentUser: { id: opportunityOwnerUser.id },
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: `concurrent-eval-community-${uniqueId}`,
      pointName: "concurrent-point",
    });
    communityId = community.id;

    await TestDataSourceHelper.createMembership({
      user: { connect: { id: opportunityOwnerUser.id } },
      community: { connect: { id: communityId } },
      status: "JOINED",
      reason: "INVITED",
    });

    await TestDataSourceHelper.createWallet({
      type: WalletType.COMMUNITY,
      community: { connect: { id: communityId } },
    });

    await TestDataSourceHelper.createWallet({
      type: WalletType.MEMBER,
      user: { connect: { id: opportunityOwnerUser.id } },
      community: { connect: { id: communityId } },
    });
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
    await container.resolve<PrismaClientIssuer>("PrismaClientIssuer").disconnect();
  });

  it("should handle concurrent evaluations with VC issuance successfully", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concurrentEvaluations = 3;

    const participations: ParticipationData[] = [];
    for (let i = 0; i < concurrentEvaluations; i++) {
      const participationUser = await TestDataSourceHelper.createUser({
        name: `Concurrent Participant ${i}`,
        slug: `concurrent-participant-${uniqueId}-${i}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      await TestDataSourceHelper.createIdentity({
        uid: `concurrent-eval-phone-${uniqueId}-${i}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
        status: "JOINED",
        reason: "INVITED",
      });

      await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
      });

      const opportunity = await TestDataSourceHelper.createOpportunity({
        title: `Concurrent Opportunity ${i}`,
        description: "Concurrent test opportunity",
        category: "ACTIVITY",
        publishStatus: "PUBLIC",
        pointsToEarn: 100,
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: ctx.currentUser!.id } },
      });

      const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunity.id } },
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        capacity: 10,
      });

      const reservation = await TestDataSourceHelper.createReservation({
        opportunitySlot: { connect: { id: opportunitySlot.id } },
      });

      const participation = await TestDataSourceHelper.createParticipation({
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
        reservation: { connect: { id: reservation.id } },
        status: "PARTICIPATING",
        reason: "RESERVATION_JOINED",
      });

      participations.push({
        participation,
        userId: participationUser.id,
      });
    }

    mockDIDVCClient.call.mockResolvedValue({ jobId: "concurrent-vc-job" });

    const evaluationPromises = participations.map(({ participation }) =>
      useCase.evaluatePassParticipation(ctx, {
        participationId: participation.id,
        status: GqlEvaluationStatus.Passed,
        comment: "Concurrent evaluation test",
      })
    );

    const results = await Promise.all(evaluationPromises);

    results.forEach((result, index) => {
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation?.status).toBe("PASSED");
      expect(result.evaluation?.comment).toBe("Concurrent evaluation test");
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    for (const [index, { userId }] of participations.entries()) {
      const participationWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
      expect(participationWallet?.currentPointView?.currentPoint).toBe(BigInt(100));

      const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(results[index].evaluation!.id);
      expect(vcRequest).toBeDefined();
      expect(vcRequest?.status).toBe("PROCESSING");
      expect(vcRequest?.jobId).toBe("concurrent-vc-job");
    }

    expect(mockDIDVCClient.call).toHaveBeenCalledTimes(concurrentEvaluations);
  });

  it("should handle concurrent evaluations with mixed VC API responses", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concurrentEvaluations = 3;

    const participations: ParticipationData[] = [];
    for (let i = 0; i < concurrentEvaluations; i++) {
      const participationUser = await TestDataSourceHelper.createUser({
        name: `Mixed Concurrent Participant ${i}`,
        slug: `mixed-concurrent-participant-${uniqueId}-${i}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      await TestDataSourceHelper.createIdentity({
        uid: `mixed-concurrent-phone-${uniqueId}-${i}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
        status: "JOINED",
        reason: "INVITED",
      });

      await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
      });

      const opportunity = await TestDataSourceHelper.createOpportunity({
        title: `Mixed Concurrent Opportunity ${i}`,
        description: "Mixed concurrent test opportunity",
        category: "ACTIVITY",
        publishStatus: "PUBLIC",
        pointsToEarn: 100,
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: ctx.currentUser!.id } },
      });

      const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunity.id } },
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        capacity: 10,
      });

      const reservation = await TestDataSourceHelper.createReservation({
        opportunitySlot: { connect: { id: opportunitySlot.id } },
      });

      const participation = await TestDataSourceHelper.createParticipation({
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
        reservation: { connect: { id: reservation.id } },
        status: "PARTICIPATING",
        reason: "RESERVATION_JOINED",
      });

      participations.push({
        participation,
        userId: participationUser.id,
      });
    }

    mockDIDVCClient.call
      .mockResolvedValueOnce({ jobId: "mixed-vc-job-1" })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ jobId: "mixed-vc-job-3" });

    const evaluationPromises = participations.map(({ participation }) =>
      useCase.evaluatePassParticipation(ctx, {
        participationId: participation.id,
        status: GqlEvaluationStatus.Passed,
        comment: "Mixed concurrent evaluation test",
      })
    );

    const results = await Promise.all(evaluationPromises);

    results.forEach((result, index) => {
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation?.status).toBe("PASSED");
      expect(result.evaluation?.comment).toBe("Mixed concurrent evaluation test");
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    const vcRequest1 = await TestDataSourceHelper.findVCIssuanceRequest(results[0].evaluation!.id);
    expect(vcRequest1?.status).toBe("PROCESSING");
    expect(vcRequest1?.jobId).toBe("mixed-vc-job-1");

    const vcRequest2 = await TestDataSourceHelper.findVCIssuanceRequest(results[1].evaluation!.id);
    expect(vcRequest2?.status).toBe("PENDING");
    expect(vcRequest2?.errorMessage).toBe("External API call failed");
    expect(vcRequest2?.jobId).toBeNull();

    const vcRequest3 = await TestDataSourceHelper.findVCIssuanceRequest(results[2].evaluation!.id);
    expect(vcRequest3?.status).toBe("PROCESSING");
    expect(vcRequest3?.jobId).toBe("mixed-vc-job-3");
  });

  it("should maintain database consistency during concurrent evaluations with failures", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concurrentEvaluations = 4;

    const participations: ParticipationData[] = [];
    for (let i = 0; i < concurrentEvaluations; i++) {
      const participationUser = await TestDataSourceHelper.createUser({
        name: `Consistency Evaluation User ${i}`,
        slug: `consistency-eval-user-${uniqueId}-${i}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      await TestDataSourceHelper.createIdentity({
        uid: `consistency-eval-phone-${uniqueId}-${i}`,
        platform: IdentityPlatform.PHONE,
        authToken: "test-auth-token",
        refreshToken: "test-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
      });

      await TestDataSourceHelper.createMembership({
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
        status: "JOINED",
        reason: "INVITED",
      });

      await TestDataSourceHelper.createWallet({
        type: WalletType.MEMBER,
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
      });

      const opportunity = await TestDataSourceHelper.createOpportunity({
        title: `Consistency Evaluation Opportunity ${i}`,
        description: "Consistency evaluation test opportunity",
        category: "ACTIVITY",
        publishStatus: "PUBLIC",
        pointsToEarn: 100,
        community: { connect: { id: communityId } },
        createdByUser: { connect: { id: ctx.currentUser!.id } },
      });

      const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunity.id } },
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 3600000),
        capacity: 10,
      });

      const reservation = await TestDataSourceHelper.createReservation({
        opportunitySlot: { connect: { id: opportunitySlot.id } },
      });

      const participation = await TestDataSourceHelper.createParticipation({
        user: { connect: { id: participationUser.id } },
        community: { connect: { id: communityId } },
        reservation: { connect: { id: reservation.id } },
        status: "PARTICIPATING",
        reason: "RESERVATION_JOINED",
      });

      participations.push({
        participation,
        userId: participationUser.id,
      });
    }

    mockDIDVCClient.call.mockResolvedValue(null);

    const evaluationPromises = participations.map(({ participation }) =>
      useCase.evaluatePassParticipation(ctx, {
        participationId: participation.id,
        status: GqlEvaluationStatus.Passed,
        comment: "Consistency evaluation test",
      })
    );

    const results = await Promise.all(evaluationPromises);

    results.forEach((result, index) => {
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation?.status).toBe("PASSED");
      expect(result.evaluation?.comment).toBe("Consistency evaluation test");
    });

    await TestDataSourceHelper.refreshCurrentPoints();

    for (const [index, { userId }] of participations.entries()) {
      const participationWallet = await TestDataSourceHelper.findMemberWallet(userId, communityId);
      expect(participationWallet?.currentPointView?.currentPoint).toBe(BigInt(100));

      const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(results[index].evaluation!.id);
      expect(vcRequest).toBeDefined();
      expect(vcRequest?.status).toBe("PENDING");
      expect(vcRequest?.errorMessage).toBe("External API call failed");
      expect(vcRequest?.retryCount).toBe(1);
      expect(vcRequest?.jobId).toBeNull();
    }

    const allVCRequests = await TestDataSourceHelper.findAllVCIssuanceRequests();
    expect(allVCRequests).toHaveLength(concurrentEvaluations);

    const evaluationIds = results.map(r => r.evaluation!.id);
    const uniqueEvaluationIds = new Set(evaluationIds);
    expect(uniqueEvaluationIds.size).toBe(concurrentEvaluations);
  });
});
