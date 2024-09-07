import {
  GqlActivity,
  GqlActivityDeleteSuccess,
  GqlActivityCreateSuccess,
  GqlActivitiesConnection,
  GqlActivityUpdateContentSuccess,
  GqlActivityUpdateUserSuccess,
  GqlUser,
  GqlEvent,
  GqlActivitySwitchPrivacySuccess,
  GqlActivityUpdateEventSuccess,
} from "@/types/graphql";
import {
  ActivityCreatePayloadWithArgs,
  ActivityGetPayloadWithArgs,
  ActivityUpdateContentPayloadWithArgs,
} from "@/domains/activity/type";

export default class ActivityResponseFormat {
  static query(activities: GqlActivity[], hasNextPage: boolean): GqlActivitiesConnection {
    return {
      totalCount: activities.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: activities[0]?.id,
        endCursor: activities.length ? activities[activities.length - 1].id : undefined,
      },
      edges: activities.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(activity: ActivityGetPayloadWithArgs): GqlActivity {
    return {
      ...activity,
      user: activity.user,
      event: activity.event,
    };
  }

  static create(activity: ActivityCreatePayloadWithArgs): GqlActivityCreateSuccess {
    return {
      __typename: "ActivityCreateSuccess",
      activity: {
        ...activity,
        user: activity.user,
        event: activity.event,
      },
    };
  }

  static updateContent(
    activity: ActivityUpdateContentPayloadWithArgs,
  ): GqlActivityUpdateContentSuccess {
    return {
      __typename: "ActivityUpdateContentSuccess",
      activity: {
        ...activity,
        user: activity.user,
        event: activity.event,
      },
    };
  }

  static delete(id: string): GqlActivityDeleteSuccess {
    return { activityId: id };
  }

  static switchPrivacy(activity: GqlActivity): GqlActivitySwitchPrivacySuccess {
    return {
      __typename: "ActivitySwitchPrivacySuccess",
      activity,
    };
  }

  static updateUser(activity: GqlActivity, user: GqlUser): GqlActivityUpdateUserSuccess {
    return {
      __typename: "ActivityUpdateUserSuccess",
      activity,
      user,
    };
  }

  static updateEvent(activity: GqlActivity, event: GqlEvent): GqlActivityUpdateEventSuccess {
    return {
      __typename: "ActivityUpdateEventSuccess",
      activity,
      event,
    };
  }
}
