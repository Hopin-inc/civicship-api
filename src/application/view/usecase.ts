import { injectable } from "tsyringe";
import { GqlPortfolio } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";

@injectable()
export default class ViewUseCase {
  async visitorBrowsePortfolios(parent: PrismaUserDetail, ctx: IContext): Promise<GqlPortfolio[]> {
    const participations = (
      await ctx.loaders.portfolioParticipation.loadMany(parent.participations.map((p) => p.id))
    ).filter((p): p is GqlPortfolio => p !== null && !(p instanceof Error));

    const articlesWrittenByMe = (
      await ctx.loaders.portfolioArticle.loadMany(parent.articlesWrittenByMe.map((a) => a.id))
    ).filter((a): a is GqlPortfolio => a !== null && !(a instanceof Error));

    const articlesAboutMe = (
      await ctx.loaders.portfolioArticle.loadMany(parent.articlesAboutMe.map((a) => a.id))
    ).filter((a): a is GqlPortfolio => a !== null && !(a instanceof Error));

    const articles = [...articlesWrittenByMe, ...articlesAboutMe];

    return [...participations, ...articles].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // const sliced = merged.slice(0, take);
    // const hasNextPage = merged.length > take;

    // return ViewPresenter.query(sliced, hasNextPage);
  }
}
