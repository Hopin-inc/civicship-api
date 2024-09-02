import {
  GqlApplicationConfirmation,
  GqlApplicationConfirmationCreateSuccess,
  GqlApplicationConfirmationsConnection,
} from "@/types/graphql";
import {
  ApplicationConfirmationCreatePayloadWithArgs,
  ApplicationConfirmationGetPayloadWithArgs,
} from "@/domains/applicationConfirmation/type";

export default class ApplicationConfirmationResponseFormat {
  static query(
    applicationConfirmations: GqlApplicationConfirmation[],
    hasNextPage: boolean,
  ): GqlApplicationConfirmationsConnection {
    return {
      totalCount: applicationConfirmations.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: applicationConfirmations[0]?.id,
        endCursor: applicationConfirmations.length
          ? applicationConfirmations[applicationConfirmations.length - 1].id
          : undefined,
      },
      edges: applicationConfirmations.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(confirmation: ApplicationConfirmationGetPayloadWithArgs): GqlApplicationConfirmation {
    return {
      ...confirmation,
      application: {
        ...confirmation.application,
        event: confirmation.application.event,
        user: confirmation.application.user,
      },
      confirmedBy: confirmation.confirmedBy,
    };
  }

  static create(
    confirmation: ApplicationConfirmationCreatePayloadWithArgs,
  ): GqlApplicationConfirmationCreateSuccess {
    return {
      __typename: "ApplicationConfirmationCreateSuccess",
      applicationConfirmation: {
        ...confirmation,
        application: {
          ...confirmation.application,
          event: confirmation.application.event,
          user: confirmation.application.user,
        },
        confirmedBy: confirmation.confirmedBy,
      },
    };
  }
}
