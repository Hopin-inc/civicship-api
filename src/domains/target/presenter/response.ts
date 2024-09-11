import {
  GqlTarget,
  GqlTargetsConnection,
  GqlTargetCreateSuccess,
  GqlTargetDeleteSuccess,
  GqlTargetUpdateContentSuccess,
  GqlGroup,
  GqlOrganization,
  GqlTargetUpdateIndexSuccess,
  GqlTargetUpdateGroupSuccess,
  GqlTargetUpdateOrganizationSuccess,
  GqlIndex,
} from "@/types/graphql";
import { TargetDefaultPayloadWithArgs } from "@/domains/target/type";

export default class TargetResponseFormat {
  static query(targets: GqlTarget[], hasNextPage: boolean): GqlTargetsConnection {
    return {
      totalCount: targets.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: targets[0]?.id,
        endCursor: targets.length ? targets[targets.length - 1].id : undefined,
      },
      edges: targets.map((target) => ({
        cursor: target.id,
        node: target,
      })),
    };
  }

  static get(target: TargetDefaultPayloadWithArgs): GqlTarget {
    return {
      ...target,
      index: target.index,
      group: target.group,
      organization: target.organization,
    };
  }

  static create(target: TargetDefaultPayloadWithArgs): GqlTargetCreateSuccess {
    return {
      __typename: "TargetCreateSuccess",
      target,
    };
  }

  static delete(id: string): GqlTargetDeleteSuccess {
    return {
      __typename: "TargetDeleteSuccess",
      targetId: id,
    };
  }

  static updateContent(target: TargetDefaultPayloadWithArgs): GqlTargetUpdateContentSuccess {
    return {
      __typename: "TargetUpdateContentSuccess",
      target,
    };
  }

  static updateGroup(target: GqlTarget, group: GqlGroup): GqlTargetUpdateGroupSuccess {
    return {
      __typename: "TargetUpdateGroupSuccess",
      target,
      group,
    };
  }

  static updateOrganization(
    target: GqlTarget,
    organization: GqlOrganization,
  ): GqlTargetUpdateOrganizationSuccess {
    return {
      __typename: "TargetUpdateOrganizationSuccess",
      target,
      organization,
    };
  }

  static updateIndex(target: GqlTarget, index: GqlIndex): GqlTargetUpdateIndexSuccess {
    return {
      __typename: "TargetUpdateIndexSuccess",
      target,
      index,
    };
  }
}
