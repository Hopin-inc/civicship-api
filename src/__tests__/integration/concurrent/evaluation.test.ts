import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import { CurrentPrefecture, IdentityPlatform, MembershipStatus, MembershipStatusReason, OpportunityCategory, ParticipationStatus, ParticipationStatusReason, PublishStatus, Role } from "@prisma/client";
import { GqlEvaluationStatus } from "@/types/graphql";
import { registerProductionDependencies } from "@/application/provider";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Concurrent Evaluation Integration Tests", () => {
  let useCase: EvaluationUseCase;
  let mockDIDVCClient: jest.Mocked<DIDVCServerClient>;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();
    container.reset();

    mockDIDVCClient = { call: jest.fn() } as any;

    registerProductionDependencies();
    container.register("PrismaClientIssuer", {
      useValue: new PrismaClientIssuer(),
    });
    container.register("DIDVCServerClient", { useValue: mockDIDVCClient });

    useCase = container.resolve(EvaluationUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
    await container.resolve<PrismaClientIssuer>("PrismaClientIssuer").disconnect();
  });

  it("should handle concurrent evaluations with VC issuance successfully", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concurrentEvaluations = 3;

    const opportunityOwnerUser = await TestDataSourceHelper.createUser({
      name: `Opportunity Owner ${uniqueId}`,
      slug: `opportunity-owner-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx: IContext = {
      uid: `concurrent-evaluation-uid-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: `concurrent-evaluation-community-${uniqueId}`,
      pointName: "pt",
    });

    const participations = [];
    for (let i = 0; i < concurrentEvaluations; i++) {
      const participationUser = await TestDataSourceHelper.createUser({
        name: `Participation User ${i} ${uniqueId}`,
        slug: `participation-user-${i}-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      await TestDataSourceHelper.createMembership({
        userId: participationUser.id,
        communityId: community.id,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      await TestDataSourceHelper.createMemberWallet(participationUser.id, community.id);

      await TestDataSourceHelper.updateIdentity(`participation-phone-${i}-${uniqueId}`, {
        uid: `participation-phone-${i}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        userId: participationUser.id,
        authToken: "test-phone-auth-token",
        refreshToken: "test-phone-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      });

      const opportunity = await TestDataSourceHelper.createOpportunity({
        title: `Concurrent Evaluation Opportunity ${i}`,
        category: OpportunityCategory.ACTIVITY,
        description: "Test opportunity for concurrent evaluation",
        community: { connect: { id: community.id } },
        createdByUser: { connect: { id: opportunityOwnerUser.id } },
        pointsToEarn: 50,
        publishStatus: PublishStatus.PUBLISHED,
      });

      const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunity.id } },
        startsAt: new Date(Date.now() - 3600000),
        endsAt: new Date(Date.now() + 3600000),
        capacity: 10,
      });

      const reservation = await TestDataSourceHelper.createReservation({
        opportunitySlot: { connect: { id: opportunitySlot.id } },
      });

      const participation = await TestDataSourceHelper.createParticipation({
        user: { connect: { id: participationUser.id } },
        opportunitySlot: { connect: { id: opportunitySlot.id } },
        reservation: { connect: { id: reservation.id } },
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
      });

      participations.push({ participation, user: participationUser });
    }

    mockDIDVCClient.call.mockResolvedValue({ jobId: "concurrent-vc-job" });

    const evaluationPromises = participations.map(({ participation }) =>
      useCase.managerBulkCreateEvaluations({
        input: {
          evaluations: [{
            participationId: participation.id,
            status: GqlEvaluationStatus.Passed,
            comment: "Concurrent evaluation test",
          }]
        },
        permission: { communityId: community.id }
      }, ctx).then(result => result.evaluations[0])
    );

    const results = await Promise.all(evaluationPromises);

    results.forEach((result, index) => {
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation?.comment).toBe("Concurrent evaluation test");
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    for (const [index, result] of results.entries()) {
      const vcRequest = await TestDataSourceHelper.findVCIssuanceRequest(result.evaluation!.id);
      expect(vcRequest).toBeDefined();
      expect(vcRequest?.status).toBe("PROCESSING");
      expect(vcRequest?.jobId).toBe("concurrent-vc-job");
    }

    expect(mockDIDVCClient.call).toHaveBeenCalledTimes(concurrentEvaluations);
  });

  it("should handle concurrent evaluations with mixed VC API responses", async () => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concurrentEvaluations = 3;

    const opportunityOwnerUser = await TestDataSourceHelper.createUser({
      name: `Mixed Opportunity Owner ${uniqueId}`,
      slug: `mixed-opportunity-owner-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx: IContext = {
      uid: `mixed-concurrent-evaluation-uid-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: `mixed-concurrent-evaluation-community-${uniqueId}`,
      pointName: "pt",
    });

    const participations = [];
    for (let i = 0; i < concurrentEvaluations; i++) {
      const participationUser = await TestDataSourceHelper.createUser({
        name: `Mixed Participation User ${i} ${uniqueId}`,
        slug: `mixed-participation-user-${i}-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      await TestDataSourceHelper.createMembership({
        userId: participationUser.id,
        communityId: community.id,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      await TestDataSourceHelper.createMemberWallet(participationUser.id, community.id);

      await TestDataSourceHelper.updateIdentity(`mixed-participation-phone-${i}-${uniqueId}`, {
        uid: `mixed-participation-phone-${i}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        userId: participationUser.id,
        authToken: "test-phone-auth-token",
        refreshToken: "test-phone-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      });

      const opportunity = await TestDataSourceHelper.createOpportunity({
        title: `Mixed Concurrent Evaluation Opportunity ${i}`,
        category: OpportunityCategory.ACTIVITY,
        description: "Test opportunity for mixed concurrent evaluation",
        community: { connect: { id: community.id } },
        createdByUser: { connect: { id: opportunityOwnerUser.id } },
        pointsToEarn: 50,
        publishStatus: PublishStatus.PUBLISHED,
      });

      const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunity.id } },
        startsAt: new Date(Date.now() - 3600000),
        endsAt: new Date(Date.now() + 3600000),
        capacity: 10,
      });

      const reservation = await TestDataSourceHelper.createReservation({
        opportunitySlot: { connect: { id: opportunitySlot.id } },
      });

      const participation = await TestDataSourceHelper.createParticipation({
        user: { connect: { id: participationUser.id } },
        opportunitySlot: { connect: { id: opportunitySlot.id } },
        reservation: { connect: { id: reservation.id } },
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
      });

      participations.push({ participation, user: participationUser });
    }

    mockDIDVCClient.call
      .mockResolvedValueOnce({ jobId: "mixed-vc-job-1" })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ jobId: "mixed-vc-job-3" });

    const evaluationPromises = participations.map(({ participation }) =>
      useCase.managerBulkCreateEvaluations({
        input: {
          evaluations: [{
            participationId: participation.id,
            status: GqlEvaluationStatus.Passed,
            comment: "Mixed concurrent evaluation test",
          }]
        },
        permission: { communityId: community.id }
      }, ctx).then(result => result.evaluations[0])
    );

    const results = await Promise.all(evaluationPromises);

    results.forEach((result, index) => {
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation?.comment).toBe("Mixed concurrent evaluation test");
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

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

    const opportunityOwnerUser = await TestDataSourceHelper.createUser({
      name: `Consistency Opportunity Owner ${uniqueId}`,
      slug: `consistency-opportunity-owner-${uniqueId}`,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    });

    const ctx: IContext = {
      uid: `consistency-concurrent-evaluation-uid-${uniqueId}`,
      platform: IdentityPlatform.PHONE,
      phoneAuthToken: "test-phone-auth-token",
      issuer: container.resolve("PrismaClientIssuer"),
    } as IContext;

    const community = await TestDataSourceHelper.createCommunity({
      name: `consistency-concurrent-evaluation-community-${uniqueId}`,
      pointName: "pt",
    });

    const participations = [];
    for (let i = 0; i < concurrentEvaluations; i++) {
      const participationUser = await TestDataSourceHelper.createUser({
        name: `Consistency Participation User ${i} ${uniqueId}`,
        slug: `consistency-participation-user-${i}-${uniqueId}`,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      });

      await TestDataSourceHelper.createMembership({
        userId: participationUser.id,
        communityId: community.id,
        status: MembershipStatus.JOINED,
        reason: MembershipStatusReason.INVITED,
        role: Role.MEMBER,
      });

      await TestDataSourceHelper.createMemberWallet(participationUser.id, community.id);

      await TestDataSourceHelper.updateIdentity(`consistency-participation-phone-${i}-${uniqueId}`, {
        uid: `consistency-participation-phone-${i}-${uniqueId}`,
        platform: IdentityPlatform.PHONE,
        userId: participationUser.id,
        authToken: "test-phone-auth-token",
        refreshToken: "test-phone-refresh-token",
        tokenExpiresAt: new Date(Date.now() + 3600000),
      });

      const opportunity = await TestDataSourceHelper.createOpportunity({
        title: `Consistency Concurrent Evaluation Opportunity ${i}`,
        category: OpportunityCategory.ACTIVITY,
        description: "Test opportunity for consistency concurrent evaluation",
        community: { connect: { id: community.id } },
        createdByUser: { connect: { id: opportunityOwnerUser.id } },
        pointsToEarn: 50,
        publishStatus: PublishStatus.PUBLISHED,
      });

      const opportunitySlot = await TestDataSourceHelper.createOpportunitySlot({
        opportunity: { connect: { id: opportunity.id } },
        startsAt: new Date(Date.now() - 3600000),
        endsAt: new Date(Date.now() + 3600000),
        capacity: 10,
      });

      const reservation = await TestDataSourceHelper.createReservation({
        opportunitySlot: { connect: { id: opportunitySlot.id } },
      });

      const participation = await TestDataSourceHelper.createParticipation({
        user: { connect: { id: participationUser.id } },
        opportunitySlot: { connect: { id: opportunitySlot.id } },
        reservation: { connect: { id: reservation.id } },
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.RESERVATION_ACCEPTED,
      });

      participations.push({ participation, user: participationUser });
    }

    mockDIDVCClient.call.mockResolvedValue(null);

    const evaluationPromises = participations.map(({ participation }) =>
      useCase.managerBulkCreateEvaluations({
        input: {
          evaluations: [{
            participationId: participation.id,
            status: GqlEvaluationStatus.Passed,
            comment: "Consistency evaluation test",
          }]
        },
        permission: { communityId: community.id }
      }, ctx).then(result => result.evaluations[0])
    );

    const results = await Promise.all(evaluationPromises);

    results.forEach((result, index) => {
      expect(result.evaluation).toBeDefined();
      expect(result.evaluation?.comment).toBe("Consistency evaluation test");
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await TestDataSourceHelper.refreshCurrentPoints();

    const allVCRequests = await TestDataSourceHelper.findAllVCIssuanceRequests();
    expect(allVCRequests).toHaveLength(concurrentEvaluations);

    allVCRequests.forEach(request => {
      expect(request.status).toBe("PENDING");
      expect(request.errorMessage).toBe("External API call failed");
      expect(request.retryCount).toBe(1);
      expect(request.jobId).toBeNull();
    });

    const evaluationIds = results.map(r => r.evaluation!.id);
    const uniqueEvaluationIds = new Set(evaluationIds);
    expect(uniqueEvaluationIds.size).toBe(concurrentEvaluations);
  });
});
