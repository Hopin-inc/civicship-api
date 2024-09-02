import {
  GqlApplication,
  GqlApplicationDeleteSuccess,
  GqlApplicationCreateSuccess,
  GqlApplicationsConnection,
  GqlApplicationUpdateCommentSuccess,
  GqlApplicationSwitchPrivacySuccess,
} from "@/types/graphql";
import {
  ApplicationCreatePayloadWithArgs,
  ApplicationGetPayloadWithArgs,
  ApplicationUpdateContentPayloadWithArgs,
} from "@/domains/application/type";

export default class ApplicationResponseFormat {
  static query(applications: GqlApplication[], hasNextPage: boolean): GqlApplicationsConnection {
    return {
      totalCount: applications.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: applications[0]?.id,
        endCursor: applications.length ? applications[applications.length - 1].id : undefined,
      },
      edges: applications.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(application: ApplicationGetPayloadWithArgs): GqlApplication {
    return {
      ...application,
      user: application.user,
      event: application.event,
    };
  }

  static create(application: ApplicationCreatePayloadWithArgs): GqlApplicationCreateSuccess {
    return {
      __typename: "ApplicationCreateSuccess",
      application: {
        ...application,
        user: application.user,
        event: application.event,
      },
    };
  }

  static updateContent(
    application: ApplicationUpdateContentPayloadWithArgs,
  ): GqlApplicationUpdateCommentSuccess {
    return {
      __typename: "ApplicationUpdateCommentSuccess",
      application: {
        ...application,
        user: application.user,
        event: application.event,
      },
    };
  }

  static delete(id: string): GqlApplicationDeleteSuccess {
    return { applicationId: id };
  }

  static switchPrivacy(application: GqlApplication): GqlApplicationSwitchPrivacySuccess {
    return {
      __typename: "ApplicationSwitchPrivacySuccess",
      application,
    };
  }
}
