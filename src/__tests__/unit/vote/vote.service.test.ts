import "reflect-metadata";
import { MembershipStatus, Prisma, Role } from "@prisma/client";
import { container } from "tsyringe";
import VoteService from "@/application/domain/vote/service";
import { IVoteRepository } from "@/application/domain/vote/data/interface";
import VoteConverter from "@/application/domain/vote/data/converter";
import { IContext } from "@/types/server";
import { ValidationError } from "@/errors/graphql";
import { PrismaVoteTopic, PrismaVoteBallot } from "@/application/domain/vote/data/type";

// ---- Mocks ----

class MockVoteRepository implements IVoteRepository {
  findTopic = jest.fn();
  findTopicOrThrow = jest.fn();
  queryTopics = jest.fn();
  countTopics = jest.fn();
  createGate = jest.fn();
  createPowerPolicy = jest.fn();
  createTopic = jest.fn();
  createOptions = jest.fn();
  deleteTopic = jest.fn();
  findBallot = jest.fn();
  upsertBallot = jest.fn();
  incrementOptionCount = jest.fn();
  decrementOptionCount = jest.fn();
  adjustOptionTotalPower = jest.fn();
}

class MockMembershipService {
  findMembership = jest.fn();
}

class MockNftInstanceRepository {
  existsByUserAndToken = jest.fn();
  countByUserAndToken = jest.fn();
  // other methods not used by VoteService
  query = jest.fn();
  findAndReserveInstance = jest.fn();
  releaseReservation = jest.fn();
  updateStatus = jest.fn();
  findById = jest.fn();
  count = jest.fn();
  upsert = jest.fn();
  findReservedByProduct = jest.fn();
  findByIdWithTransaction = jest.fn();
}

// ---- Fixtures ----

const mockCtx = {} as IContext;
const mockTx = {} as Prisma.TransactionClient;
const userId = "user-1";
const communityId = "community-1";
const topicId = "topic-1";
const optionAId = "option-a";
const optionBId = "option-b";
const nftTokenId = "token-1";

function makeTopic(overrides: Partial<PrismaVoteTopic> = {}): PrismaVoteTopic {
  return {
    id: topicId,
    communityId,
    createdBy: "creator",
    title: "Test Vote",
    description: null,
    startsAt: new Date(Date.now() - 1000 * 60),  // 1 minute ago
    endsAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    createdAt: new Date(),
    updatedAt: null,
    gate: {
      id: "gate-1",
      type: "MEMBERSHIP",
      nftTokenId: null,
      requiredRole: null,
      topicId,
    },
    powerPolicy: {
      id: "policy-1",
      type: "FLAT",
      nftTokenId: null,
      topicId,
    },
    options: [
      { id: optionAId, topicId, label: "Option A", orderIndex: 0, voteCount: 0, totalPower: 0 },
      { id: optionBId, topicId, label: "Option B", orderIndex: 1, voteCount: 0, totalPower: 0 },
    ],
    ...overrides,
  } as PrismaVoteTopic;
}

function makeBallot(optionId: string, power: number): PrismaVoteBallot {
  return {
    id: "ballot-1",
    userId,
    topicId,
    optionId,
    power,
    createdAt: new Date(),
    updatedAt: null,
  };
}

// ---- Setup ----

let service: VoteService;
let mockRepo: MockVoteRepository;
let mockMembershipService: MockMembershipService;
let mockNftInstanceRepo: MockNftInstanceRepository;

beforeEach(() => {
  jest.clearAllMocks();
  container.reset();

  mockRepo = new MockVoteRepository();
  mockMembershipService = new MockMembershipService();
  mockNftInstanceRepo = new MockNftInstanceRepository();

  container.register("VoteRepository", { useValue: mockRepo });
  container.register("VoteConverter", { useClass: VoteConverter });
  container.register("MembershipService", { useValue: mockMembershipService });
  container.register("NftInstanceRepository", { useValue: mockNftInstanceRepo });

  service = container.resolve(VoteService);
});

// ---- validateVotingPeriod ----

describe("VoteService.validateVotingPeriod", () => {
  it("passes when topic is OPEN", () => {
    const topic = makeTopic();
    expect(() => service.validateVotingPeriod(topic)).not.toThrow();
  });

  it("throws when voting has not started yet", () => {
    const topic = makeTopic({
      startsAt: new Date(Date.now() + 1000 * 60 * 60),
      endsAt: new Date(Date.now() + 1000 * 60 * 120),
    });
    expect(() => service.validateVotingPeriod(topic)).toThrow(ValidationError);
  });

  it("throws when voting period has ended", () => {
    const topic = makeTopic({
      startsAt: new Date(Date.now() - 1000 * 60 * 120),
      endsAt: new Date(Date.now() - 1000 * 60),
    });
    expect(() => service.validateVotingPeriod(topic)).toThrow(ValidationError);
  });
});

// ---- checkEligibility ----

describe("VoteService.checkEligibility", () => {
  describe("MEMBERSHIP gate", () => {
    const topic = makeTopic({
      gate: { id: "gate-1", type: "MEMBERSHIP", nftTokenId: null, requiredRole: null, topicId },
    } as Partial<PrismaVoteTopic>);

    it("returns eligible when user is a JOINED MEMBER", async () => {
      mockMembershipService.findMembership.mockResolvedValue({
        status: MembershipStatus.JOINED,
        role: Role.MEMBER,
      });
      const result = await service.checkEligibility(mockCtx, userId, topic);
      expect(result.eligible).toBe(true);
    });

    it("returns ineligible when user has no membership", async () => {
      mockMembershipService.findMembership.mockResolvedValue(null);
      const result = await service.checkEligibility(mockCtx, userId, topic);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("NOT_A_MEMBER");
    });

    it("returns ineligible when membership is not JOINED", async () => {
      mockMembershipService.findMembership.mockResolvedValue({
        status: MembershipStatus.PENDING,
        role: Role.MEMBER,
      });
      const result = await service.checkEligibility(mockCtx, userId, topic);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("NOT_A_MEMBER");
    });

    it("returns ineligible when user role is below requiredRole", async () => {
      const topicWithRoleReq = makeTopic({
        gate: { id: "gate-1", type: "MEMBERSHIP", nftTokenId: null, requiredRole: Role.MANAGER, topicId },
      } as Partial<PrismaVoteTopic>);
      mockMembershipService.findMembership.mockResolvedValue({
        status: MembershipStatus.JOINED,
        role: Role.MEMBER,
      });
      const result = await service.checkEligibility(mockCtx, userId, topicWithRoleReq);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("INSUFFICIENT_ROLE");
    });

    it("returns eligible when user is MANAGER and requiredRole is MANAGER", async () => {
      const topicWithRoleReq = makeTopic({
        gate: { id: "gate-1", type: "MEMBERSHIP", nftTokenId: null, requiredRole: Role.MANAGER, topicId },
      } as Partial<PrismaVoteTopic>);
      mockMembershipService.findMembership.mockResolvedValue({
        status: MembershipStatus.JOINED,
        role: Role.MANAGER,
      });
      const result = await service.checkEligibility(mockCtx, userId, topicWithRoleReq);
      expect(result.eligible).toBe(true);
    });

    it("returns eligible when user is OWNER and requiredRole is MANAGER (higher role satisfies)", async () => {
      const topicWithRoleReq = makeTopic({
        gate: { id: "gate-1", type: "MEMBERSHIP", nftTokenId: null, requiredRole: Role.MANAGER, topicId },
      } as Partial<PrismaVoteTopic>);
      mockMembershipService.findMembership.mockResolvedValue({
        status: MembershipStatus.JOINED,
        role: Role.OWNER,
      });
      const result = await service.checkEligibility(mockCtx, userId, topicWithRoleReq);
      expect(result.eligible).toBe(true);
    });
  });

  describe("NFT gate", () => {
    const topicNft = makeTopic({
      gate: { id: "gate-1", type: "NFT", nftTokenId, requiredRole: null, topicId },
    } as Partial<PrismaVoteTopic>);

    it("returns eligible when user owns the required NFT", async () => {
      mockNftInstanceRepo.existsByUserAndToken.mockResolvedValue(true);
      const result = await service.checkEligibility(mockCtx, userId, topicNft);
      expect(result.eligible).toBe(true);
      expect(mockNftInstanceRepo.existsByUserAndToken).toHaveBeenCalledWith(mockCtx, userId, nftTokenId, undefined);
    });

    it("returns ineligible when user does not own the required NFT", async () => {
      mockNftInstanceRepo.existsByUserAndToken.mockResolvedValue(false);
      const result = await service.checkEligibility(mockCtx, userId, topicNft);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("REQUIRED_NFT_NOT_FOUND");
    });

    it("returns ineligible when NFT gate has no nftTokenId configured", async () => {
      const topicNoToken = makeTopic({
        gate: { id: "gate-1", type: "NFT", nftTokenId: null, requiredRole: null, topicId },
      } as Partial<PrismaVoteTopic>);
      const result = await service.checkEligibility(mockCtx, userId, topicNoToken);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe("GATE_NFT_TOKEN_NOT_CONFIGURED");
    });
  });

  it("returns ineligible when gate is not configured", async () => {
    const topicNoGate = makeTopic({ gate: null } as Partial<PrismaVoteTopic>);
    const result = await service.checkEligibility(mockCtx, userId, topicNoGate);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("GATE_NOT_CONFIGURED");
  });
});

// ---- calculatePower ----

describe("VoteService.calculatePower", () => {
  it("returns 1 for FLAT policy", async () => {
    const topic = makeTopic();
    const power = await service.calculatePower(mockCtx, userId, topic);
    expect(power).toBe(1);
  });

  it("returns NFT count for NFT_COUNT policy", async () => {
    const topic = makeTopic({
      powerPolicy: { id: "policy-1", type: "NFT_COUNT", nftTokenId, topicId },
    } as Partial<PrismaVoteTopic>);
    mockNftInstanceRepo.countByUserAndToken.mockResolvedValue(3);
    const power = await service.calculatePower(mockCtx, userId, topic);
    expect(power).toBe(3);
    expect(mockNftInstanceRepo.countByUserAndToken).toHaveBeenCalledWith(mockCtx, userId, nftTokenId, undefined);
  });

  it("throws ValidationError when NFT_COUNT policy has no nftTokenId", async () => {
    const topic = makeTopic({
      powerPolicy: { id: "policy-1", type: "NFT_COUNT", nftTokenId: null, topicId },
    } as Partial<PrismaVoteTopic>);
    await expect(service.calculatePower(mockCtx, userId, topic)).rejects.toThrow(ValidationError);
    expect(mockNftInstanceRepo.countByUserAndToken).not.toHaveBeenCalled();
  });

  it("returns 1 when powerPolicy is null", async () => {
    const topic = makeTopic({ powerPolicy: null } as Partial<PrismaVoteTopic>);
    const power = await service.calculatePower(mockCtx, userId, topic);
    expect(power).toBe(1);
  });
});

// ---- updateOptionCounts ----

describe("VoteService.updateOptionCounts", () => {
  it("increments new option on first vote", async () => {
    const newBallot = makeBallot(optionAId, 1);
    await service.updateOptionCounts(mockCtx, null, newBallot, 1, mockTx);

    expect(mockRepo.decrementOptionCount).not.toHaveBeenCalled();
    expect(mockRepo.adjustOptionTotalPower).not.toHaveBeenCalled();
    expect(mockRepo.incrementOptionCount).toHaveBeenCalledWith(mockCtx, optionAId, 1, mockTx);
  });

  it("decrements old option and increments new option on different-option re-vote", async () => {
    const existingBallot = makeBallot(optionAId, 2);
    const newBallot = makeBallot(optionBId, 3);
    await service.updateOptionCounts(mockCtx, existingBallot, newBallot, 3, mockTx);

    expect(mockRepo.decrementOptionCount).toHaveBeenCalledWith(mockCtx, optionAId, 2, mockTx);
    expect(mockRepo.incrementOptionCount).toHaveBeenCalledWith(mockCtx, optionBId, 3, mockTx);
    expect(mockRepo.adjustOptionTotalPower).not.toHaveBeenCalled();
  });

  it("only adjusts totalPower delta on same-option re-vote (voteCount unchanged)", async () => {
    const existingBallot = makeBallot(optionAId, 2);
    const newBallot = makeBallot(optionAId, 5);
    await service.updateOptionCounts(mockCtx, existingBallot, newBallot, 5, mockTx);

    expect(mockRepo.decrementOptionCount).not.toHaveBeenCalled();
    expect(mockRepo.incrementOptionCount).not.toHaveBeenCalled();
    expect(mockRepo.adjustOptionTotalPower).toHaveBeenCalledWith(mockCtx, optionAId, 3, mockTx); // delta = 5 - 2
  });

  it("adjusts totalPower with negative delta on same-option re-vote after NFT sold", async () => {
    const existingBallot = makeBallot(optionAId, 5);
    const newBallot = makeBallot(optionAId, 2);
    await service.updateOptionCounts(mockCtx, existingBallot, newBallot, 2, mockTx);

    expect(mockRepo.adjustOptionTotalPower).toHaveBeenCalledWith(mockCtx, optionAId, -3, mockTx); // delta = 2 - 5
    expect(mockRepo.decrementOptionCount).not.toHaveBeenCalled();
    expect(mockRepo.incrementOptionCount).not.toHaveBeenCalled();
  });

  it("skips adjustOptionTotalPower when delta is zero on same-option re-vote", async () => {
    const existingBallot = makeBallot(optionAId, 3);
    const newBallot = makeBallot(optionAId, 3);
    await service.updateOptionCounts(mockCtx, existingBallot, newBallot, 3, mockTx);

    // adjustOptionTotalPower is called with delta=0, repo impl skips the update
    expect(mockRepo.adjustOptionTotalPower).toHaveBeenCalledWith(mockCtx, optionAId, 0, mockTx);
    expect(mockRepo.decrementOptionCount).not.toHaveBeenCalled();
    expect(mockRepo.incrementOptionCount).not.toHaveBeenCalled();
  });
});
