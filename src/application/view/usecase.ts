import { inject, injectable } from "tsyringe";
import { GqlPortfolio, GqlUserPortfoliosArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaUserDetail } from "@/application/domain/account/user/data/type";
import ParticipationRepository from "@/application/domain/experience/participation/data/repository";
import ArticleRepository from "@/application/domain/content/article/data/repository";
import ViewConverter from "@/application/view/data/converter";
import ViewPresenter from "@/application/view/presenter";

@injectable()
export default class ViewUseCase {
  constructor(
    @inject("ParticipationRepository")
    private readonly participationRepository: ParticipationRepository,
    @inject("ArticleRepository")
    private readonly articleRepository: ArticleRepository,
    @inject(ViewConverter)
    private readonly converter: ViewConverter,
  ) {}

  async visitorBrowsePortfolios(
    parent: PrismaUserDetail,
    args: GqlUserPortfoliosArgs,
    ctx: IContext,
  ): Promise<GqlPortfolio[]> {
    const filter = args.filter;
    const order = args.sort?.date ?? "desc";
    const sortOrder = this.converter.sort(args.sort);

    const [participations, articles] = await Promise.all([
      this.participationRepository.queryForPortfolio(
        ctx,
        this.converter.filterParticipation(parent.id, filter),
        [{ opportunitySlot: { startsAt: sortOrder } }],
        args.first ?? 10,
      ),
      this.articleRepository.queryForPortfolio(
        ctx,
        this.converter.filterArticle(parent.id, filter),
        [{ publishedAt: sortOrder }],
        args.first ?? 10,
      ),
    ]);

    const portfolios: GqlPortfolio[] = [
      ...participations.map(ViewPresenter.getFromParticipation),
      ...articles.map(ViewPresenter.getFromArticle),
    ].filter((p): p is GqlPortfolio => !!p);

    const uniqueById = Array.from(new Map(portfolios.map((item) => [item.id, item])).values());
    return uniqueById.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }
}
