import { inject, injectable } from "tsyringe";
import { GqlPortfolio, GqlPortfoliosConnection, GqlUserPortfoliosArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/application/domain/utils";
import {
  participationForPortfolioInclude,
  PrismaParticipationForPortfolio,
} from "@/application/domain/experience/participation/data/type";
import { ValidParticipationForPortfolio } from "@/application/view/service";
import ViewConverter from "@/application/view/data/converter";
import ViewPresenter from "@/application/view/presenter";
import ParticipationService from "@/application/domain/experience/participation/service";
import ArticleService from "@/application/domain/content/article/service";
import { articleForPortfolioInclude } from "@/application/domain/content/article/data/type";

@injectable()
export default class ViewUseCase {
  constructor(
    @inject("ParticipationService") private readonly participationService: ParticipationService,
    @inject("ArticleService") private readonly articleService: ArticleService,
  ) {}

  async visitorBrowsePortfolios(
    { filter, sort, cursor, first }: GqlUserPortfoliosArgs,
    ctx: IContext,
  ): Promise<GqlPortfoliosConnection> {
    const take = clampFirst(first);
    const participationSort = ViewConverter.sort(sort);
    const articleSort = ViewConverter.sort(sort);

    const [participations, articles] = await Promise.all([
      this.participationService.fetchParticipations(
        ctx,
        { filter, sort: participationSort, cursor },
        take,
        participationForPortfolioInclude,
      ),
      this.articleService.fetchArticles(
        ctx,
        { filter, sort: articleSort, cursor },
        take,
        articleForPortfolioInclude,
      ),
    ]);

    const safeParticipations = participations
      .slice(0, take)
      .filter(this.hasSlotAndOpportunity)
      .map((p) => ViewPresenter.getFromParticipation(p));

    const articlePortfolios = articles.slice(0, take).map((a) => ViewPresenter.getFromArticle(a));

    const merged: GqlPortfolio[] = [...safeParticipations, ...articlePortfolios].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    const sliced = merged.slice(0, take);
    const hasNextPage = merged.length > take;

    return ViewPresenter.query(sliced, hasNextPage);
  }

  private hasSlotAndOpportunity(
    p: PrismaParticipationForPortfolio,
  ): p is ValidParticipationForPortfolio {
    return !!p.reservation?.opportunitySlot && !!p.reservation?.opportunitySlot.opportunity;
  }
}
