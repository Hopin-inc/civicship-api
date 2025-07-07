import { inject, injectable } from "tsyringe";
import { GqlQueryPortfoliosArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import ViewUseCase from "@/application/view/usecase";

@injectable()
export default class ViewResolver {
  constructor(@inject("ViewUseCase") private readonly useCase: ViewUseCase) {}

  Query = {
    portfolios: (parent, args: GqlQueryPortfoliosArgs, ctx: IContext) => {
      return this.useCase.visitorBrowsePortfolios(parent, args, ctx);
    },
  };
}
