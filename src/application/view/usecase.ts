import { GqlPortfolio, GqlPortfoliosConnection, GqlUserPortfoliosArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";
import ParticipationService from "@/application/domain/participation/service";
import ViewConverter from "@/application/view/data/converter";
import ViewPresenter from "@/application/view/presenter";
import {
  participationForPortfolioInclude,
  PrismaParticipationForPortfolio,
} from "@/application/domain/participation/data/type";
import { ValidParticipationForPortfolio } from "@/application/view/service";
import ArticleService from "@/application/domain/article/service";
import { articleForPortfolioInclude } from "@/application/domain/article/data/type";

export default class ViewUseCase {
  static async visitorBrowsePortfolios(
    { filter, sort, cursor, first }: GqlUserPortfoliosArgs,
    ctx: IContext,
  ): Promise<GqlPortfoliosConnection> {
    const take = clampFirst(first);
    const participationSort = ViewConverter.sort(sort);
    const articleSort = ViewConverter.sort(sort);

    const [participations, articles] = await Promise.all([
      ParticipationService.fetchParticipations(
        ctx,
        { filter, sort: participationSort, cursor },
        take,
        participationForPortfolioInclude,
      ),
      ArticleService.fetchArticles(
        ctx,
        { filter, sort: articleSort, cursor },
        take,
        articleForPortfolioInclude,
      ),
    ]);

    const safeParticipations = participations
      .slice(0, take)
      .filter(hasSlotAndOpportunity)
      .map((p) => ViewPresenter.getFromParticipation(p));

    const articlePortfolios = articles.slice(0, take).map((a) => ViewPresenter.getFromArticle(a));

    const merged: GqlPortfolio[] = [...safeParticipations, ...articlePortfolios].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const sliced = merged.slice(0, take);
    const hasNextPage = merged.length > take;

    return ViewPresenter.query(sliced, hasNextPage);
  }
}

function hasSlotAndOpportunity(
  p: PrismaParticipationForPortfolio,
): p is ValidParticipationForPortfolio {
  return !!p.reservation?.opportunitySlot && !!p.reservation?.opportunitySlot.opportunity;
}
