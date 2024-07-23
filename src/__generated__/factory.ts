import {
  defineUserFactory,
  defineActivityFactory,
  defineEventFactory,
  // defineCityFactory,
  // defineStateFactory,
} from "./fabbrica";

export const UserFactory = defineUserFactory();
export const EventFactory = defineEventFactory();
export const ActivityFactory = defineActivityFactory({
  defaultData: { user: UserFactory, event: EventFactory },
});
