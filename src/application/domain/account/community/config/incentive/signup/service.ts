import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import ISignupBonusConfigRepository from "./data/interface";
import { CommunitySignupBonusConfig, Prisma } from "@prisma/client";
import { ValidationError } from "@/errors/graphql";
import { GqlUpdateSignupBonusConfigInput } from "@/types/graphql";

@injectable()
export default class SignupBonusConfigService {
  constructor(
    @inject("SignupBonusConfigRepository")
    private readonly repository: ISignupBonusConfigRepository,
  ) {}

  async get(
    ctx: IContext,
    communityId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CommunitySignupBonusConfig | null> {
    return this.repository.get(ctx, communityId, tx);
  }

  async update(
    ctx: IContext,
    communityId: string,
    input: GqlUpdateSignupBonusConfigInput,
    tx: Prisma.TransactionClient,
  ): Promise<CommunitySignupBonusConfig> {
    // Validation
    if (input.bonusPoint !== undefined) {
      // Range: 1-1,000,000pt (業務要件に基づく。上限は誤設定防止のため)
      if (input.bonusPoint < 1 || input.bonusPoint > 1_000_000) {
        throw new ValidationError("bonusPoint must be between 1 and 1,000,000", [
          String(input.bonusPoint),
        ]);
      }
    }

    if (input.message?.length && input.message.length > 1000) {
      throw new ValidationError("message must be 1000 characters or less", [
        String(input.message.length),
      ]);
    }

    // Build update data
    const updateData: Prisma.CommunitySignupBonusConfigUpdateInput = {};
    if (input.isEnabled !== undefined) {
      updateData.isEnabled = input.isEnabled;
    }
    if (input.bonusPoint !== undefined) {
      updateData.bonusPoint = input.bonusPoint;
    }
    if (input.message !== undefined) {
      updateData.message = input.message;
    }

    return this.repository.upsert(ctx, communityId, updateData, tx);
  }
}
