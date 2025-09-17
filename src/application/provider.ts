import { container } from "tsyringe";
import { prismaClient, PrismaClientIssuer } from "@/infrastructure/prisma/client";
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
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";
import NftInstanceRepository from "@/application/domain/account/nft-instance/data/repository";
import NftInstanceConverter from "@/application/domain/account/nft-instance/data/converter";
import NftInstanceService from "@/application/domain/account/nft-instance/service";
import NftInstanceUseCase from "@/application/domain/account/nft-instance/usecase";
import NftMintUseCase from "@/application/domain/account/nft-mint/usecase";
import NftMintService from "@/application/domain/account/nft-mint/service";
import { NftMintRepository } from "@/application/domain/account/nft-mint/data/repository";
import NftMintConverter from "@/application/domain/account/nft-mint/data/converter";
import NftMintPresenter from "@/application/domain/account/nft-mint/presenter";
import { MeshMintAdapter } from "@/application/domain/account/nft-mint/mint/meshAdapter";
import { MeshClient } from "@/infrastructure/libs/mesh";
import NftWalletResolver from "@/application/domain/account/nft-wallet/controller/resolver";
import NftTokenRepository from "@/application/domain/account/nft-token/data/repository";
import IdentityService from "@/application/domain/account/identity/service";
import IdentityUseCase from "@/application/domain/account/identity/usecase";
import IdentityRepository from "@/application/domain/account/identity/data/repository";
import IdentityConverter from "@/application/domain/account/identity/data/converter";
import DIDIssuanceRequestRepository from "@/application/domain/account/identity/didIssuanceRequest/data/repository";
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
import ParticipationStatusHistoryService from "@/application/domain/experience/participation/statusHistory/service";
import ParticipationStatusHistoryRepository from "@/application/domain/experience/participation/statusHistory/data/repository";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import TicketService from "@/application/domain/reward/ticket/service";
import TicketRepository from "@/application/domain/reward/ticket/data/repository";
import PlaceUseCase from "@/application/domain/location/place/usecase";
import PlaceService from "@/application/domain/location/place/service";
import PlaceRepository from "@/application/domain/location/place/data/repository";
import PlaceConverter from "@/application/domain/location/place/data/converter";
import MasterUseCase from "@/application/domain/location/master/usecase";
import MasterService from "@/application/domain/location/master/service";
import MasterRepository from "@/application/domain/location/master/data/repository";
import MasterConverter from "@/application/domain/location/master/data/converter";
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
import TicketClaimLinkConverter from "@/application/domain/reward/ticketClaimLink/data/converter";
import { TicketIssuerUseCase } from "@/application/domain/reward/ticketIssuer/usecase";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { DIDIssuanceService } from "@/application/domain/account/identity/didIssuanceRequest/service";
import { VCIssuanceRequestService } from "@/application/domain/experience/evaluation/vcIssuanceRequest/service";
import { VCIssuanceRequestRepository } from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/repository";
import VCIssuanceRequestUseCase from "@/application/domain/experience/evaluation/vcIssuanceRequest/usecase";
import VCIssuanceRequestConverter from "@/application/domain/experience/evaluation/vcIssuanceRequest/data/converter";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import CommunityConfigRepository from "@/application/domain/account/community/config/data/repository";

export function registerProductionDependencies() {
  // ------------------------------
  // 🏗️ Infrastructure
  // ------------------------------

  container.register("prismaClient", { useValue: prismaClient });
  container.register("PrismaClientIssuer", { useClass: PrismaClientIssuer });
  container.register("getCurrentUserId", { useValue: getCurrentUserId });
  
  container.register("MeshClient", { useClass: MeshClient });

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
  container.register("NFTWalletRepository", { useClass: NFTWalletRepository });
  container.register("NftTokenRepository", { useClass: NftTokenRepository });
  container.register("NftInstanceRepository", { useClass: NftInstanceRepository });
  container.register("NFTWalletService", { useClass: NFTWalletService });
  container.register("UserUseCase", { useClass: UserUseCase });

  container.register("NftInstanceRepository", { useClass: NftInstanceRepository });
  container.register("NftInstanceConverter", { useClass: NftInstanceConverter });
  container.register("NftInstanceService", { useClass: NftInstanceService });
  container.register("NftInstanceUseCase", { useClass: NftInstanceUseCase });
  container.register("NftMintRepository", { useClass: NftMintRepository });
  container.register("NftMintConverter", { useClass: NftMintConverter });
  container.register("NftMintPresenter", { useClass: NftMintPresenter });
  container.register("MintAdapter", { useClass: MeshMintAdapter });
  container.register("NftMintService", { useClass: NftMintService });
  container.register("NftMintUseCase", { useClass: NftMintUseCase });
  container.register("NftWalletResolver", { useClass: NftWalletResolver });

  // 🏘️ Community
  container.register("CommunityRepository", { useClass: ICommunityRepository });
  container.register("CommunityConverter", { useClass: CommunityConverter });
  container.register("CommunityService", { useClass: CommunityService });
  container.register("CommunityUseCase", { useClass: CommunityUseCase });

  container.register("CommunityConfigService", { useClass: CommunityConfigService });
  container.register("CommunityConfigRepository", { useClass: CommunityConfigRepository });

  // 🆔 Identity
  container.register("IdentityService", { useClass: IdentityService });
  container.register("IdentityUseCase", { useClass: IdentityUseCase });
  container.register("IdentityRepository", { useClass: IdentityRepository });
  container.register("IdentityConverter", { useClass: IdentityConverter });

  // DID・VC
  container.register("DIDVCServerClient", { useClass: DIDVCServerClient });
  container.register("DIDIssuanceService", { useClass: DIDIssuanceService });
  container.register("DIDIssuanceRequestRepository", { useClass: DIDIssuanceRequestRepository });

  container.register("VCIssuanceRequestUseCase", { useClass: VCIssuanceRequestUseCase });
  container.register("VCIssuanceRequestConverter", { useClass: VCIssuanceRequestConverter });
  container.register("VCIssuanceRequestService", { useClass: VCIssuanceRequestService });
  container.register("VCIssuanceRequestRepository", { useClass: VCIssuanceRequestRepository });

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
  container.register("TicketClaimLinkConverter", { useClass: TicketClaimLinkConverter });

  // 🧾 TicketIssuer
  container.register("TicketIssuerUseCase", { useClass: TicketIssuerUseCase });
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

  container.register("MasterUseCase", { useClass: MasterUseCase });
  container.register("MasterService", { useClass: MasterService });
  container.register("MasterRepository", { useClass: MasterRepository });
  container.register("MasterConverter", { useClass: MasterConverter });

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
