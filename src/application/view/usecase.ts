import { injectable } from "tsyringe";
import { GqlPortfolio } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";

@injectable()
export default class ViewUseCase {
  async visitorBrowsePortfolios(parent: PrismaUserDetail, ctx: IContext): Promise<GqlPortfolio[]> {
    const participations = await ctx.loaders.participationPortfolioByUser.load(parent.id);
    const articles = await ctx.loaders.articlePortfolioByUser.load(parent.id);

    const merged = [...participations, ...articles];
    const uniqueById = Array.from(new Map(merged.map((item) => [item.id, item])).values());
    return uniqueById.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
