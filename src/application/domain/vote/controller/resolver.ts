import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";
import {
  GqlQueryVoteTopicsArgs,
  GqlQueryVoteTopicArgs,
  GqlQueryMyVoteEligibilityArgs,
  GqlMutationVoteTopicCreateArgs,
  GqlMutationVoteCastArgs,
  GqlMutationVoteTopicDeleteArgs,
} from "@/types/graphql";
import {
  PrismaVoteTopic,
  PrismaVoteGate,
  PrismaVotePowerPolicy,
  PrismaVoteBallot,
} from "@/application/domain/vote/data/type";
import VoteUseCase from "@/application/domain/vote/usecase";
import VotePresenter from "@/application/domain/vote/presenter";

@injectable()
export default class VoteResolver {
  constructor(@inject("VoteUseCase") private readonly voteUseCase: VoteUseCase) {}

  Query = {
    voteTopics: (_: unknown, args: GqlQueryVoteTopicsArgs, ctx: IContext) =>
      this.voteUseCase.anyoneBrowseVoteTopics(ctx, args),

    voteTopic: (_: unknown, args: GqlQueryVoteTopicArgs, ctx: IContext) =>
      this.voteUseCase.anyoneViewVoteTopic(ctx, args),

    myVoteEligibility: (_: unknown, args: GqlQueryMyVoteEligibilityArgs, ctx: IContext) =>
      this.voteUseCase.userGetMyVoteEligibility(ctx, args),
  };

  Mutation = {
    voteTopicCreate: (_: unknown, args: GqlMutationVoteTopicCreateArgs, ctx: IContext) =>
      this.voteUseCase.managerCreateVoteTopic(ctx, args),

    voteCast: (_: unknown, args: GqlMutationVoteCastArgs, ctx: IContext) =>
      this.voteUseCase.userCastVote(ctx, args),

    voteTopicDelete: (_: unknown, args: GqlMutationVoteTopicDeleteArgs, ctx: IContext) =>
      this.voteUseCase.managerDeleteVoteTopic(ctx, args),
  };

  VoteTopic = {
    community: (parent: PrismaVoteTopic, _: unknown, ctx: IContext) =>
      ctx.loaders.community.load(parent.communityId),

    myBallot: async (parent: PrismaVoteTopic & { resultVisible?: boolean }, _: unknown, ctx: IContext) => {
      if (!ctx.currentUser) return null;
      const ballot = await ctx.loaders.myVoteBallot.load({
        userId: ctx.currentUser.id,
        topicId: parent.id,
      });
      if (!ballot) return null;
      // resultVisible は VotePresenter.topic() が親オブジェクトに付加したメタデータ
      return VotePresenter.ballot(ballot, parent.resultVisible ?? false);
    },

    myEligibility: (parent: PrismaVoteTopic, _: unknown, ctx: IContext) => {
      if (!ctx.currentUser) return null;
      return this.voteUseCase.userGetMyVoteEligibility(ctx, { topicId: parent.id });
    },
  };

  VoteGate = {
    nftToken: (parent: PrismaVoteGate, _: unknown, ctx: IContext) => {
      if (!parent.nftTokenId) return null;
      return ctx.loaders.nftToken.load(parent.nftTokenId);
    },
  };

  VotePowerPolicy = {
    nftToken: (parent: PrismaVotePowerPolicy, _: unknown, ctx: IContext) => {
      if (!parent.nftTokenId) return null;
      return ctx.loaders.nftToken.load(parent.nftTokenId);
    },
  };

  VoteBallot = {
    option: async (parent: PrismaVoteBallot & { optionId: string; resultVisible?: boolean }, _: unknown, ctx: IContext) => {
      const option = await ctx.loaders.voteOption.load(parent.optionId);
      if (!option) throw new NotFoundError("VoteOption", { id: parent.optionId });
      // 結果秘匿の適用は Presenter に委譲（resolver にマスクロジックを持たない）
      return VotePresenter.option(option, parent.resultVisible ?? false);
    },
  };
}
