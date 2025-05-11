import { container } from "tsyringe";

import IdentityResolver from "@/application/domain/account/identity/controller/resolver";
import UserResolver from "@/application/domain/account/user/controller/resolver";
import WalletResolver from "@/application/domain/account/wallet/controller/resolver";
import MembershipResolver from "@/application/domain/account/membership/controller/resolver";
import CommunityResolver from "@/application/domain/account/community/controller/resolver";
import ArticleResolver from "@/application/domain/content/article/controller/resolver";
import OpportunityResolver from "@/application/domain/experience/opportunity/controller/resolver";
import OpportunitySlotResolver from "@/application/domain/experience/opportunitySlot/controller/resolver";
import ReservationResolver from "@/application/domain/experience/reservation/controller/resolver";
import ParticipationResolver from "@/application/domain/experience/participation/controller/resolver";
import EvaluationResolver from "@/application/domain/experience/evaluation/controller/resolver";
import PlaceResolver from "@/application/domain/location/place/controller/resolver";
import TicketResolver from "@/application/domain/reward/ticket/controller/resolver";
import UtilityResolver from "@/application/domain/reward/utility/controller/resolver";
import TransactionResolver from "@/application/domain/transaction/controller/resolver";
import TicketClaimLinkResolver from "@/application/domain/reward/ticketClaimLink/controller/resolver";

const identity = container.resolve(IdentityResolver);
const user = container.resolve(UserResolver);
const wallet = container.resolve(WalletResolver);
const membership = container.resolve(MembershipResolver);
const community = container.resolve(CommunityResolver);

const article = container.resolve(ArticleResolver);

const opportunity = container.resolve(OpportunityResolver);
const opportunitySlot = container.resolve(OpportunitySlotResolver);
const reservation = container.resolve(ReservationResolver);
const participation = container.resolve(ParticipationResolver);
const evaluation = container.resolve(EvaluationResolver);

const place = container.resolve(PlaceResolver);

const ticket = container.resolve(TicketResolver);
const ticketClaimLink = container.resolve(TicketClaimLinkResolver);
const utility = container.resolve(UtilityResolver);

const transaction = container.resolve(TransactionResolver);

const resolvers = {
  Query: {
    ...identity.Query,
    ...user.Query,
    ...community.Query,
    ...membership.Query,
    ...wallet.Query,
    ...article.Query,
    ...opportunity.Query,
    ...opportunitySlot.Query,
    ...reservation.Query,
    ...participation.Query,
    ...evaluation.Query,
    ...place.Query,
    ...utility.Query,
    ...ticket.Query,
    ...ticketClaimLink.Query,
    ...transaction.Query,
  },
  Mutation: {
    ...identity.Mutation,
    ...user.Mutation,
    ...community.Mutation,
    ...membership.Mutation,
    ...opportunity.Mutation,
    ...opportunitySlot.Mutation,
    ...reservation.Mutation,
    ...participation.Mutation,
    ...evaluation.Mutation,
    ...place.Mutation,
    ...utility.Mutation,
    ...ticket.Mutation,
    ...transaction.Mutation,
  },
  Identity: identity.Identity,
  User: user.User,
  Wallet: wallet.Wallet,
  Membership: membership.Membership,
  Community: community.Community,
  Article: article.Article,
  Opportunity: opportunity.Opportunity,
  OpportunitySlot: opportunitySlot.OpportunitySlot,
  Reservation: reservation.Reservation,
  Participation: participation.Participation,
  Evaluation: evaluation.Evaluation,
  Place: place.Place,
  Ticket: ticket.Ticket,
  Utility: utility.Utility,
  Transaction: transaction.Transaction,
};

export default resolvers;
