import { container } from "tsyringe";
import { prismaClient } from "@/infrastructure/prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import TransactionRepository from "@/application/domain/transaction/data/repository";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import ICommunityRepository from "@/application/domain/account/community/data/repository";
import TransactionService from "@/application/domain/transaction/service";
import MembershipService from "@/application/domain/account/membership/service";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import CommunityService from "@/application/domain/account/community/service";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import UserService from "@/application/domain/account/user/service";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import IdentityConverter from "@/application/domain/account/identity/data/converter";
import ArticleUseCase from "@/application/domain/content/article/usecase";
import ArticleService from "@/application/domain/content/article/service";
import ArticleRepository from "@/application/domain/content/article/data/repository";
import ArticleConverter from "@/application/domain/content/article/data/converter";
import ImageService from "@/application/domain/content/image/service";
import NotificationService from "@/application/domain/notification/service";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import OpportunityRepository from "@/application/domain/experience/opportunity/data/repository";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";
import OpportunitySlotRepository from "@/application/domain/experience/opportunitySlot/data/repository";
import OpportunitySlotConverter from "@/application/domain/experience/opportunitySlot/data/converter";
import ReservationUseCase from "@/application/domain/experience/reservation/usecase";
import ReservationRepository from "@/application/domain/experience/reservation/data/repository";
import ReservationConverter from "@/application/domain/experience/reservation/data/converter";
import ReservationService from "@/application/domain/experience/reservation/service";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationService from "@/application/domain/experience/participation/service";
import ParticipationRepository from "@/application/domain/experience/participation/data/repository";
import ParticipationStatusHistoryUseCase from "@/application/domain/experience/participation/statusHistory/usecase";
import ParticipationStatusHistoryService from "@/application/domain/experience/participation/statusHistory/service";
import ParticipationStatusHistoryRepository from "@/application/domain/experience/participation/statusHistory/data/repository";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import TicketService from "@/application/domain/reward/ticket/service";
import TicketRepository from "@/application/domain/reward/ticket/data/repository";
import PlaceUseCase from "@/application/domain/location/place/usecase";
import PlaceService from "@/application/domain/location/place/service";
import PlaceRepository from "@/application/domain/location/place/data/repository";
import PlaceConverter from "@/application/domain/location/place/data/converter";
import ViewUseCase from "@/application/view/usecase";
import MembershipConverter from "@/application/domain/account/membership/data/converter";
import { getCurrentUserId } from "@/application/domain/utils";
import WalletRepository from "@/application/domain/account/wallet/data/repository";
import WalletConverter from "@/application/domain/account/wallet/data/converter";
import UserRepository from "@/application/domain/account/user/data/repository";
import UserConverter from "@/application/domain/account/user/data/converter";
import OpportunityConverter from "@/application/domain/experience/opportunity/data/converter";
import CommunityConverter from "@/application/domain/account/community/data/converter";
import UserUseCase from "@/application/domain/account/user/usecase";
import ParticipationConverter from "@/application/domain/experience/participation/data/converter";
import ParticipationStatusHistoryConverter from "@/application/domain/experience/participation/statusHistory/data/converter";
import TicketConverter from "@/application/domain/reward/ticket/data/converter";
import TicketClaimLinkService from "@/application/domain/reward/ticketClaimLink/service";
import TicketClaimLinkRepository from "@/application/domain/reward/ticketClaimLink/data/repository";
import TicketIssuerService from "@/application/domain/reward/ticketIssuer/service";
import TicketIssuerRepository from "@/application/domain/reward/ticketIssuer/data/repository";
import EvaluationUseCase from "@/application/domain/experience/evaluation/usecase";
import EvaluationService from "@/application/domain/experience/evaluation/service";
import EvaluationConverter from "@/application/domain/experience/evaluation/data/converter";
import EvaluationRepository from "@/application/domain/experience/evaluation/data/repository";
import TicketIssuerConverter from "@/application/domain/reward/ticketIssuer/data/converter";
import UtilityUseCase from "@/application/domain/reward/utility/usecase";
import UtilityService from "@/application/domain/reward/utility/service";
import UtilityConverter from "@/application/domain/reward/utility/data/converter";
import UtilityRepository from "@/application/domain/reward/utility/data/repository";
import MembershipRepository from "@/application/domain/account/membership/data/repository";
import ReservationValidator from "@/application/domain/experience/reservation/validator";
import WalletUseCase from "@/application/domain/account/wallet/usecase";
import TicketClaimLinkUseCase from "@/application/domain/reward/ticketClaimLink/usecase";

export function registerProductionDependencies() {
  // ------------------------------
  // 🏗️ Infrastructure
  // ------------------------------

  container.register("prismaClient", { useValue: prismaClient });
  container.register("getCurrentUserId", { useValue: getCurrentUserId });

  // ------------------------------
  // 👥 Account
  // ------------------------------

  // 🪪 Membership
  container.register("MembershipRepository", { useClass: MembershipRepository });
  container.register("MembershipUseCase", { useClass: MembershipUseCase });
  container.register("MembershipService", { useClass: MembershipService });
  container.register("MembershipConverter", { useClass: MembershipConverter });

  // 👛 Wallet
  container.register("WalletUseCase", { useClass: WalletUseCase });
  container.register("WalletService", { useClass: WalletService });
  container.register("WalletValidator", { useClass: WalletValidator });
  container.register("WalletRepository", { useClass: WalletRepository });
  container.register("WalletConverter", { useClass: WalletConverter });

  // 🙋 User
  container.register("UserRepository", { useClass: UserRepository });
  container.register("UserConverter", { useClass: UserConverter });
  container.register("UserService", { useClass: UserService });
  container.register("UserUseCase", { useClass: UserUseCase });

  // 🏘️ Community
  container.register("CommunityRepository", { useClass: ICommunityRepository });
  container.register("CommunityConverter", { useClass: CommunityConverter });
  container.register("CommunityService", { useClass: CommunityService });
  container.register("CommunityUseCase", { useClass: CommunityUseCase });

  // 🆔 Identity
  container.register("IdentityService", { useClass: IdentityService });
  container.register("IdentityUseCase", { useClass: IdentityUseCase });
  container.register("IdentityRepository", { useClass: IdentityRepository });
  container.register("IdentityConverter", { useClass: IdentityConverter });

  // ------------------------------
  // 📰 Content
  // ------------------------------

  container.register("ArticleUseCase", { useClass: ArticleUseCase });
  container.register("ArticleService", { useClass: ArticleService });
  container.register("ArticleRepository", { useClass: ArticleRepository });
  container.register("ArticleConverter", { useClass: ArticleConverter });

  container.register("ImageService", { useClass: ImageService });

  // ------------------------------
  // ✉️ Notification
  // ------------------------------

  container.register("NotificationService", { useClass: NotificationService });

  // ------------------------------
  // 🎯 Experience
  // ------------------------------

  // 🪧 Opportunity
  container.register("OpportunityUseCase", { useClass: OpportunityUseCase });
  container.register("OpportunityService", { useClass: OpportunityService });
  container.register("OpportunityConverter", { useClass: OpportunityConverter });
  container.register("OpportunityRepository", { useClass: OpportunityRepository });

  // 🕰️ OpportunitySlot
  container.register("OpportunitySlotUseCase", { useClass: OpportunitySlotUseCase });
  container.register("OpportunitySlotService", { useClass: OpportunitySlotService });
  container.register("OpportunitySlotRepository", { useClass: OpportunitySlotRepository });
  container.register("OpportunitySlotConverter", { useClass: OpportunitySlotConverter });

  // 📅 Reservation
  container.register("ReservationUseCase", { useClass: ReservationUseCase });
  container.register("ReservationService", { useClass: ReservationService });
  container.register("ReservationRepository", { useClass: ReservationRepository });
  container.register("ReservationConverter", { useClass: ReservationConverter });
  container.register("ReservationValidator", { useClass: ReservationValidator });

  // 🧍 Participation
  container.register("ParticipationUseCase", { useClass: ParticipationUseCase });
  container.register("ParticipationService", { useClass: ParticipationService });
  container.register("ParticipationConverter", { useClass: ParticipationConverter });
  container.register("ParticipationRepository", { useClass: ParticipationRepository });

  // 🔄 ParticipationStatusHistory
  container.register("ParticipationStatusHistoryUseCase", {
    useClass: ParticipationStatusHistoryUseCase,
  });
  container.register("ParticipationStatusHistoryService", {
    useClass: ParticipationStatusHistoryService,
  });
  container.register("ParticipationStatusHistoryConverter", {
    useClass: ParticipationStatusHistoryConverter,
  });
  container.register("ParticipationStatusHistoryRepository", {
    useClass: ParticipationStatusHistoryRepository,
  });

  // ------------------------------
  // 🎁 Reward
  // ------------------------------

  // 🧠 Evaluation
  container.register("EvaluationUseCase", { useClass: EvaluationUseCase });
  container.register("EvaluationService", { useClass: EvaluationService });
  container.register("EvaluationConverter", { useClass: EvaluationConverter });
  container.register("EvaluationRepository", { useClass: EvaluationRepository });

  // 🛠️ Utility
  container.register("UtilityUseCase", { useClass: UtilityUseCase });
  container.register("UtilityService", { useClass: UtilityService });
  container.register("UtilityConverter", { useClass: UtilityConverter });
  container.register("UtilityRepository", { useClass: UtilityRepository });

  // 🎟️ Ticket
  container.register("TicketUseCase", { useClass: TicketUseCase });
  container.register("TicketService", { useClass: TicketService });
  container.register("TicketConverter", { useClass: TicketConverter });
  container.register("TicketRepository", { useClass: TicketRepository });

  // 🏷️ TicketClaimLink
  container.register("TicketClaimLinkUseCase", { useClass: TicketClaimLinkUseCase });
  container.register("TicketClaimLinkService", { useClass: TicketClaimLinkService });
  container.register("TicketClaimLinkRepository", { useClass: TicketClaimLinkRepository });

  // 🧾 TicketIssuer
  container.register("TicketIssuerService", { useClass: TicketIssuerService });
  container.register("TicketIssuerConverter", { useClass: TicketIssuerConverter });
  container.register("TicketIssuerRepository", { useClass: TicketIssuerRepository });

  // ------------------------------
  // 📍 Location
  // ------------------------------

  container.register("PlaceUseCase", { useClass: PlaceUseCase });
  container.register("PlaceService", { useClass: PlaceService });
  container.register("PlaceRepository", { useClass: PlaceRepository });
  container.register("PlaceConverter", { useClass: PlaceConverter });

  // ------------------------------
  // 💸 Transaction
  // ------------------------------

  container.register("TransactionUseCase", { useClass: TransactionUseCase });
  container.register("TransactionRepository", { useClass: TransactionRepository });
  container.register("TransactionConverter", { useClass: TransactionConverter });
  container.register("TransactionService", { useClass: TransactionService });

  // ------------------------------
  // 👓 View
  // ------------------------------

  container.register("ViewUseCase", { useClass: ViewUseCase });
}

registerProductionDependencies();
