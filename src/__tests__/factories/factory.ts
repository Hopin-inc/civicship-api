import { CurrentPrefecture, MembershipStatus, MembershipStatusReason, Role } from "@prisma/client";
import { randAnimal, randFirstName, randLastName } from "@ngneat/falso";
import {
  defineCommunityFactory,
  defineMembershipFactory,
  defineUserFactory,
} from "@/__tests__/factories/__generated__";

export const UserFactory = defineUserFactory({
  defaultData: () => ({
    name: `${randFirstName()} ${randLastName()}`,
    slug: `user-${Math.random().toString(36).substring(2, 8)}`,
    currentPrefecture: CurrentPrefecture.KAGAWA,
  }),
});

export const CommunityFactory = defineCommunityFactory({
  defaultData: () => ({
    name: randAnimal(),
    pointName: `point-${Math.random().toString(36).substring(2, 6)}`,
  }),
});

export const MembershipFactory = defineMembershipFactory.withTransientFields<{
  transientRole?: Role;
  transientStatus?: MembershipStatus;
  transientReason?: MembershipStatusReason;
}>({})({
  defaultData: ({ transientRole, transientStatus, transientReason }) => ({
    user: UserFactory,
    community: CommunityFactory,
    status: transientStatus ?? MembershipStatus.JOINED,
    role: transientRole ?? Role.MEMBER,
    histories: {
      create: [
        {
          status: transientStatus ?? MembershipStatus.JOINED,
          reason: transientReason ?? MembershipStatusReason.ACCEPTED_INVITATION,
          createdByUser: UserFactory,
        },
      ],
    },
  }),
});
