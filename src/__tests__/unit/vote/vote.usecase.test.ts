import "reflect-metadata";
import { Prisma } from "@prisma/client";
import VoteUseCase from "@/application/domain/vote/usecase";
import { IContext } from "@/types/server";
import { AuthorizationError, ValidationError } from "@/errors/graphql";
import { PrismaVoteTopic, PrismaVoteBallot } from "@/application/domain/vote/data/type";

// ---- Mock VoteService ----

const mockService = {
  acquireVoteLock: jest.fn().mockResolvedValue(undefined),
  getTopicWithRelations: jest.fn(),
  validateTopicRelations: jest.fn(),
  validateVotingPeriod: jest.fn(),
  checkEligibility: jest.fn(),
  validateOptionBelongsToTopic: jest.fn(),
  calculatePower: jest.fn(),
  findBallot: jest.fn(),
  upsertBallot: jest.fn(),
  updateOptionCounts: jest.fn().mockResolvedValue(undefined),
  calcResultVisible: jest.fn().mockReturnValue(false),
  // not called by userCastVote, included for completeness
  calcPhase: jest.fn().mockReturnValue("OPEN"),
  browseTopics: jest.fn(),
  countTopics: jest.fn(),
  findTopic: jest.fn(),
  validateTopicInput: jest.fn(),
  createTopicWithRelations: jest.fn(),
  deleteTopic: jest.fn(),
};

// ---- Fixtures ----

const userId = "user-1";
const communityId = "community-1";
const topicId = "topic-1";
const optionAId = "option-a";
const optionBId = "option-b";
const mockTx = {} as Prisma.TransactionClient;

function makeCtx(): IContext {
  return {
    currentUser: {
      id: userId,
      memberships: [{ communityId, role: "MEMBER" }],
    },
    issuer: {
      onlyBelongingCommunity: jest.fn((_ctx: IContext, fn: (tx: Prisma.TransactionClient) => unknown) =>
        fn(mockTx),
      ),
      public: jest.fn(),
      internal: jest.fn(),
    },
  } as unknown as IContext;
}

function makeTopic(): PrismaVoteTopic {
  return {
    id: topicId,
    communityId,
    createdBy: "creator",
    title: "Test Vote",
    description: null,
    startsAt: new Date(Date.now() - 1000 * 60),
    endsAt: new Date(Date.now() + 1000 * 60 * 60),
    createdAt: new Date(),
    updatedAt: null,
    gate: { id: "gate-1", type: "MEMBERSHIP", nftTokenId: null, requiredRole: null, topicId },
    powerPolicy: { id: "policy-1", type: "FLAT", nftTokenId: null, topicId },
    options: [
      { id: optionAId, topicId, label: "Option A", orderIndex: 0, voteCount: 0, totalPower: 0 },
      { id: optionBId, topicId, label: "Option B", orderIndex: 1, voteCount: 0, totalPower: 0 },
    ],
  } as PrismaVoteTopic;
}

function makeBallot(optionId: string, power: number, id = "ballot-1"): PrismaVoteBallot {
  return {
    id,
    userId,
    topicId,
    optionId,
    power,
    createdAt: new Date(),
    updatedAt: null,
  };
}

// ---- Tests ----

describe("VoteUseCase.userCastVote — 集計カラム更新の回帰テスト", () => {
  let useCase: VoteUseCase;
  let ctx: IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    // VoteUseCase の constructor は VoteService の 1 依存のみ
    useCase = new VoteUseCase(mockService as unknown as InstanceType<typeof import("@/application/domain/vote/service").default>);
    ctx = makeCtx();

    // デフォルト: 資格あり・power=1
    mockService.checkEligibility.mockResolvedValue({ eligible: true });
    mockService.calculatePower.mockResolvedValue(1);
  });

  describe("初回投票", () => {
    it("updateOptionCounts が existingBallot=null で呼ばれる", async () => {
      const topic = makeTopic();
      const newBallot = makeBallot(optionAId, 1);

      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.findBallot.mockResolvedValue(null);
      mockService.upsertBallot.mockResolvedValue(newBallot);

      await useCase.userCastVote(ctx, { input: { topicId, optionId: optionAId } });

      expect(mockService.updateOptionCounts).toHaveBeenCalledTimes(1);
      expect(mockService.updateOptionCounts).toHaveBeenCalledWith(ctx, null, newBallot, 1, mockTx);
    });

    it("payload に ballot が含まれる", async () => {
      const topic = makeTopic();
      const newBallot = makeBallot(optionAId, 1);

      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.findBallot.mockResolvedValue(null);
      mockService.upsertBallot.mockResolvedValue(newBallot);

      const result = await useCase.userCastVote(ctx, { input: { topicId, optionId: optionAId } });

      expect(result.ballot).toBeDefined();
      expect(result.ballot.id).toBe(newBallot.id);
      expect(result.ballot.power).toBe(1);
    });
  });

  describe("同一選択肢への再投票", () => {
    it("updateOptionCounts が既存投票と同じ optionId の ballot で呼ばれる", async () => {
      const topic = makeTopic();
      const existingBallot = makeBallot(optionAId, 1);
      const newBallot = makeBallot(optionAId, 1);

      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.findBallot.mockResolvedValue(existingBallot);
      mockService.upsertBallot.mockResolvedValue(newBallot);

      await useCase.userCastVote(ctx, { input: { topicId, optionId: optionAId } });

      expect(mockService.updateOptionCounts).toHaveBeenCalledWith(
        ctx, existingBallot, newBallot, 1, mockTx,
      );
      const [, existing, next] = mockService.updateOptionCounts.mock.calls[0];
      expect(existing.optionId).toBe(next.optionId);
    });

    it("NFT 売却後の power 減少も正しく伝播する", async () => {
      const topic = makeTopic();
      const existingBallot = makeBallot(optionAId, 5); // 以前は 5 NFT 保有
      const newBallot = makeBallot(optionAId, 2);      // 今は 2 NFT

      mockService.calculatePower.mockResolvedValue(2);
      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.findBallot.mockResolvedValue(existingBallot);
      mockService.upsertBallot.mockResolvedValue(newBallot);

      await useCase.userCastVote(ctx, { input: { topicId, optionId: optionAId } });

      // power=2 で updateOptionCounts が呼ばれることを確認
      expect(mockService.updateOptionCounts).toHaveBeenCalledWith(
        ctx, existingBallot, newBallot, 2, mockTx,
      );
    });
  });

  describe("別選択肢への再投票", () => {
    it("updateOptionCounts が既存投票と異なる optionId の ballot で呼ばれる", async () => {
      const topic = makeTopic();
      const existingBallot = makeBallot(optionAId, 1);
      const newBallot = makeBallot(optionBId, 1);

      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.findBallot.mockResolvedValue(existingBallot);
      mockService.upsertBallot.mockResolvedValue(newBallot);

      await useCase.userCastVote(ctx, { input: { topicId, optionId: optionBId } });

      expect(mockService.updateOptionCounts).toHaveBeenCalledWith(
        ctx, existingBallot, newBallot, 1, mockTx,
      );
      const [, existing, next] = mockService.updateOptionCounts.mock.calls[0];
      expect(existing.optionId).not.toBe(next.optionId);
    });
  });

  describe("ガード条件（updateOptionCounts が呼ばれないケース）", () => {
    it("資格なしの場合は AuthorizationError をスローし updateOptionCounts を呼ばない", async () => {
      const topic = makeTopic();
      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.checkEligibility.mockResolvedValue({ eligible: false, reason: "NOT_A_MEMBER" });

      await expect(
        useCase.userCastVote(ctx, { input: { topicId, optionId: optionAId } }),
      ).rejects.toThrow(AuthorizationError);
      expect(mockService.updateOptionCounts).not.toHaveBeenCalled();
    });

    it("power=0 の場合は ValidationError をスローし updateOptionCounts を呼ばない", async () => {
      const topic = makeTopic();
      mockService.getTopicWithRelations.mockResolvedValue(topic);
      mockService.findBallot.mockResolvedValue(null);
      mockService.calculatePower.mockResolvedValue(0);

      await expect(
        useCase.userCastVote(ctx, { input: { topicId, optionId: optionAId } }),
      ).rejects.toThrow(ValidationError);
      expect(mockService.updateOptionCounts).not.toHaveBeenCalled();
    });
  });
});
