import {
  GqlParticipation,
  GqlParticipationStatusHistoriesArgs,
  GqlParticipationStatusHistoriesConnection,
  GqlParticipationStatusHistory,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/graphql/pagination";
import ParticipationStatusHistoryService from "@/domains/opportunity/participationStatusHistory/service";
import ParticipationStatusHistoryOutputFormat from "@/domains/opportunity/participationStatusHistory/presenter/output";

export default class ParticipationStatusHistoryUseCase {
  static async visitorBrowseStatusHistoriesByParticipation(
    { id }: GqlParticipation,
    { first, cursor }: GqlParticipationStatusHistoriesArgs,
    ctx: IContext,
  ): Promise<GqlParticipationStatusHistoriesConnection> {
    const take = clampFirst(first);

    const res = await ParticipationStatusHistoryService.fetchStatusHistories(
      ctx,
      { filter: { participationId: id }, cursor: cursor },
      take,
    );
    const hasNextPage = res.length > take;

    const data: GqlParticipationStatusHistory[] = res.slice(0, take).map((record) => {
      return ParticipationStatusHistoryOutputFormat.get(record);
    });

    return ParticipationStatusHistoryOutputFormat.query(data, hasNextPage);
  }
}
