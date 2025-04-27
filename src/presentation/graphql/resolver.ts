import { mergeResolvers } from "@graphql-tools/merge";
import communityResolver from "@/application/domain/account/community/controller/resolver";
import membershipResolver from "@/application/domain/account/membership/controller/resolver";
import userResolver from "@/application/domain/account/user/controller/resolver";
import identityResolver from "@/application/domain/account/identity/controller/resolver";
import walletResolver from "@/application/domain/account/wallet/controller/resolver";
import articleResolver from "@/application/domain/content/article/controller/resolver";
import opportunityResolver from "@/application/domain/experience/opportunity/controller/resolver";
import opportunitySlotResolver from "@/application/domain/experience/opportunitySlot/controller/resolver";
import reservationResolver from "@/application/domain/experience/reservation/controller/resolver";
import participationResolver from "@/application/domain/experience/participation/controller/resolver";
import evaluationResolver from "@/application/domain/experience/evaluation/controller/resolver";
import placeResolver from "@/application/domain/location/place/controller/resolver";
import ticketResolver from "@/application/domain/reward/ticket/controller/resolver";
import utilityResolver from "@/application/domain/reward/utility/controller/resolver";
import transactionResolver from "@/application/domain/transaction/controller/resolver";

const resolvers = mergeResolvers([
  // account
  identityResolver,
  userResolver,
  communityResolver,
  membershipResolver,
  walletResolver,

  // content
  articleResolver,

  // experience
  opportunityResolver,
  opportunitySlotResolver,
  reservationResolver,
  participationResolver,
  evaluationResolver,

  // location
  placeResolver,

  // reward
  utilityResolver,
  ticketResolver,

  transactionResolver,
]);
export default resolvers;
