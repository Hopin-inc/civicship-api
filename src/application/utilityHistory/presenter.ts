import {
  GqlUtilityHistory,
  GqlUtilityHistoriesConnection,
  GqlUtilityHistoryCreateSuccess,
  GqlUtilityUseSuccess,
} from "@/types/graphql";
import { UtilityHistoryPayloadWithArgs } from "@/application/utilityHistory/data/type";

export default class UtilityHistoryOutputFormat {
  static query(
    histories: GqlUtilityHistory[],
    hasNextPage: boolean,
  ): GqlUtilityHistoriesConnection {
    return {
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: histories[0]?.id,
        endCursor: histories.length ? histories[histories.length - 1].id : undefined,
      },
      edges: histories.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: UtilityHistoryPayloadWithArgs): GqlUtilityHistory {
    return r;
  }

  static create(r: UtilityHistoryPayloadWithArgs): GqlUtilityHistoryCreateSuccess {
    return {
      __typename: "UtilityHistoryCreateSuccess",
      utilityHistory: this.get(r),
    };
  }

  static useUtility(r: UtilityHistoryPayloadWithArgs): GqlUtilityUseSuccess {
    return {
      __typename: "UtilityUseSuccess",
      utilityHistory: this.get(r),
    };
  }
}
