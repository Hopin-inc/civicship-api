import {
  randEmail,
  randAnimal,
  randSentence,
  randFirstName,
  randLastName,
  randImg,
  randCountryCode,
  randState,
  randCity,
  randBrand,
  randZipCode,
  randStreetAddress,
  randStreetName,
} from "@ngneat/falso";
import {
  defineUserFactory,
  defineActivityFactory,
  defineEventFactory,
  defineGroupFactory,
  defineUsersOnGroupsFactory,
  defineOrganizationFactory,
  defineUsersOnOrganizationsFactory,
  defineEventsOnGroupsFactory,
  defineEventsOnOrganizationsFactory,
  defineLikeFactory,
  defineCommentFactory,
  defineTargetFactory,
  defineAgendaFactory,
  defineAgendasOnUsersFactory,
  defineAgendasOnGroupsFactory,
  defineAgendasOnOrganizationsFactory,
  defineAgendasOnEventsFactory,
  defineCityFactory,
  defineStateFactory,
  defineCitiesOnUsersFactory,
  defineCitiesOnGroupsFactory,
  defineCitiesOnOrganizationsFactory,
  defineCitiesOnEventsFactory,
  defineIndexFactory,
} from "../../__generated__/fabbrica";

// Base Factories
export const IndexFactory = defineIndexFactory({
    defaultData: {
      name: randAnimal(),
      description: randSentence(),
    },
  }),
  UserFactory = defineUserFactory({
    defaultData: {
      firstName: randFirstName(),
      lastName: randLastName(),
      image: randImg(),
      email: randEmail(),
      bio: randSentence(),
    },
  }),
  EventFactory = defineEventFactory({
    defaultData: { description: randSentence() },
  }),
  StateFactory = defineStateFactory({
    defaultData: { countryCode: randCountryCode(), name: randState() },
  }),
  AgendaFactory = defineAgendaFactory({
    defaultData: { name: randAnimal(), description: randSentence() },
  });

// 関連データを持つファクトリ
export const ActivityFactory = defineActivityFactory({
    defaultData: {
      user: UserFactory,
      event: EventFactory,
      description: randSentence(),
    },
  }),
  CityFactory = defineCityFactory({
    defaultData: { name: randCity(), state: StateFactory },
  }),
  OrganizationFactory = defineOrganizationFactory({
    defaultData: {
      entity: randBrand(),
      name: randAnimal(),
      city: CityFactory,
      state: StateFactory,
      zipcode: randZipCode(),
      address1: randStreetAddress(),
      address2: randStreetName(),
    },
  }),
  LikeFactory = defineLikeFactory({
    defaultData: { user: UserFactory, event: EventFactory },
  }),
  CommentFactory = defineCommentFactory({
    defaultData: {
      user: UserFactory,
      event: EventFactory,
      content: randSentence(),
    },
  });

// 組織関連のファクトリ
export const GroupFactory = defineGroupFactory({
    defaultData: {
      name: randAnimal(),
      bio: randSentence(),
      organization: OrganizationFactory,
    },
  }),
  UsersOnGroupsFactory = defineUsersOnGroupsFactory({
    defaultData: { user: UserFactory, group: GroupFactory },
  }),
  UsersOnOrganizationsFactory = defineUsersOnOrganizationsFactory({
    defaultData: { user: UserFactory, organization: OrganizationFactory },
  }),
  EventsOnGroupsFactory = defineEventsOnGroupsFactory({
    defaultData: { group: GroupFactory, event: EventFactory },
  }),
  EventsOnOrganizationsFactory = defineEventsOnOrganizationsFactory({
    defaultData: { organization: OrganizationFactory, event: EventFactory },
  });

// 複数の関係を持つファクトリ
export const TargetFactory = defineTargetFactory({
  defaultData: {
    event: EventFactory,
    group: GroupFactory,
    organization: OrganizationFactory,
    index: IndexFactory,
  },
});

// アジェンダ関連のファクトリ
export const AgendasOnUsersFactory = defineAgendasOnUsersFactory({
    defaultData: { user: UserFactory, agenda: AgendaFactory },
  }),
  AgendasOnGroupsFactory = defineAgendasOnGroupsFactory({
    defaultData: { agenda: AgendaFactory, group: GroupFactory },
  }),
  AgendasOnOrganizationsFactory = defineAgendasOnOrganizationsFactory({
    defaultData: { agenda: AgendaFactory, organization: OrganizationFactory },
  }),
  AgendasOnEventsFactory = defineAgendasOnEventsFactory({
    defaultData: { agenda: AgendaFactory, event: EventFactory },
  });

// 都市関連のファクトリ
export const CitiesOnUsersFactory = defineCitiesOnUsersFactory({
    defaultData: { city: CityFactory, user: UserFactory },
  }),
  CitiesOnGroupsFactory = defineCitiesOnGroupsFactory({
    defaultData: { city: CityFactory, group: GroupFactory },
  }),
  CitiesOnOrganizationsFactory = defineCitiesOnOrganizationsFactory({
    defaultData: { city: CityFactory, organization: OrganizationFactory },
  }),
  CitiesOnEventsFactory = defineCitiesOnEventsFactory({
    defaultData: { city: CityFactory, event: EventFactory },
  });
