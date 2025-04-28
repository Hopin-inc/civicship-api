import "reflect-metadata";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import TransactionRepository from "@/application/domain/transaction/data/repository";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import TransactionService from "@/application/domain/transaction/service";
import MembershipService from "@/application/domain/account/membership/service";
import MembershipUseCase from "@/application/domain/account/membership/usecase";
import WalletService from "@/application/domain/account/wallet/service";
import WalletValidator from "@/application/domain/account/wallet/validator";
import CommunityService from "@/application/domain/account/community/service";
import CommunityUseCase from "@/application/domain/account/community/usecase";
import UserService from "@/application/domain/account/user/service";
import IdentityService from "@/application/domain/account/identity/service";
import ArticleUseCase from "@/application/domain/content/article/usecase";
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
import { ReservationRepository } from "@/application/domain/experience/reservation/data/repository";
import ReservationConverter from "@/application/domain/experience/reservation/data/converter";
import { ReservationService } from "@/application/domain/experience/reservation/service";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationService from "@/application/domain/experience/participation/service";
import { ParticipationRepository } from "@/application/domain/experience/participation/data/repository";
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

// ------------------------------
// 🚀 container.register
// ------------------------------

// Infrastructure
container.register("PrismaClientIssuer", { useClass: PrismaClientIssuer });

// Transaction
container.register("TransactionUseCase", { useClass: TransactionUseCase });
container.register("TransactionRepository", { useClass: TransactionRepository });
container.register("TransactionConverter", { useClass: TransactionConverter });
container.register("TransactionService", { useClass: TransactionService });

// Account
container.register("MembershipService", { useClass: MembershipService });
container.register("MembershipUseCase", { useClass: MembershipUseCase });
container.register("WalletService", { useClass: WalletService });
container.register("WalletValidator", { useClass: WalletValidator });
container.register("CommunityService", { useClass: CommunityService });
container.register("CommunityUseCase", { useClass: CommunityUseCase });
container.register("UserService", { useClass: UserService });
container.register("IdentityService", { useClass: IdentityService });

// Content
container.register("ArticleUseCase", { useClass: ArticleUseCase });
container.register("ImageService", { useClass: ImageService });
container.register("NotificationService", { useClass: NotificationService });

// Experience: Opportunity
container.register("OpportunityUseCase", { useClass: OpportunityUseCase });
container.register("OpportunityService", { useClass: OpportunityService });
container.register("OpportunityRepository", { useClass: OpportunityRepository });

// Experience: OpportunitySlot
container.register("OpportunitySlotUseCase", { useClass: OpportunitySlotUseCase });
container.register("OpportunitySlotService", { useClass: OpportunitySlotService });
container.register("OpportunitySlotRepository", { useClass: OpportunitySlotRepository });
container.register("OpportunitySlotConverter", { useClass: OpportunitySlotConverter });

// Experience: Reservation
container.register("ReservationUseCase", { useClass: ReservationUseCase });
container.register("ReservationService", { useClass: ReservationService });
container.register("ReservationRepository", { useClass: ReservationRepository });
container.register("ReservationConverter", { useClass: ReservationConverter });

// Experience: Participation
container.register("ParticipationUseCase", { useClass: ParticipationUseCase });
container.register("ParticipationService", { useClass: ParticipationService });
container.register("ParticipationRepository", { useClass: ParticipationRepository });

// Experience: ParticipationStatusHistory
container.register("ParticipationStatusHistoryUseCase", {
  useClass: ParticipationStatusHistoryUseCase,
});
container.register("ParticipationStatusHistoryService", {
  useClass: ParticipationStatusHistoryService,
});
container.register("ParticipationStatusHistoryRepository", {
  useClass: ParticipationStatusHistoryRepository,
});

// Reward: Ticket
container.register("TicketUseCase", { useClass: TicketUseCase });
container.register("TicketService", { useClass: TicketService });
container.register("TicketRepository", { useClass: TicketRepository });

// Location: Place
container.register("PlaceUseCase", { useClass: PlaceUseCase });
container.register("PlaceService", { useClass: PlaceService });
container.register("PlaceRepository", { useClass: PlaceRepository });
container.register("PlaceConverter", { useClass: PlaceConverter });

// View
container.register("ViewUseCase", { useClass: ViewUseCase });
