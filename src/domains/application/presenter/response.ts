import {
  GqlApplication,
  GqlApplicationDeleteSuccess,
  GqlApplicationCreateSuccess,
  GqlApplicationsConnection,
  GqlApplicationUpdateCommentSuccess,
  GqlApplicationSwitchPrivacySuccess,
  GqlApplicationDeleteConfirmationSuccess,
  GqlApplicationUpdateConfirmationCommentSuccess,
  GqlApplicationSwitchIsApprovedSuccess,
  GqlApplicationAddConfirmationSuccess,
} from "@/types/graphql";
import {
  ApplicationUpdateConfirmationPayloadWithArgs,
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
      approvals: application.approvals,
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

  static addConfirmation(
    application: ApplicationUpdateConfirmationPayloadWithArgs,
  ): GqlApplicationAddConfirmationSuccess {
    return {
      __typename: "ApplicationAddConfirmationSuccess",
      application: {
        ...application,
        user: application.user,
        event: application.event,
        approvals: application.approvals,
      },
    };
  }

  static switchIsApproved(application: GqlApplication): GqlApplicationSwitchIsApprovedSuccess {
    return {
      __typename: "ApplicationSwitchIsApprovedSuccess",
      application,
    };
  }

  static updateConfirmationComment(
    application: ApplicationUpdateConfirmationPayloadWithArgs,
  ): GqlApplicationUpdateConfirmationCommentSuccess {
    return {
      __typename: "ApplicationUpdateConfirmationCommentSuccess",
      application: {
        ...application,
        user: application.user,
        event: application.event,
        approvals: application.approvals,
      },
    };
  }

  static deleteConfirmation(
    applicationId: string,
    applicationConfirmationId: string,
  ): GqlApplicationDeleteConfirmationSuccess {
    return {
      __typename: "ApplicationDeleteConfirmationSuccess",
      applicationId,
      applicationConfirmationId,
    };
  }
}
