import "reflect-metadata";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import OpportunityRepository from "@/application/domain/experience/opportunity/data/repository";
import OpportunitySlotUseCase from "@/application/domain/experience/opportunitySlot/usecase";
import OpportunitySlotService from "@/application/domain/experience/opportunitySlot/service";
import OpportunitySlotRepository from "@/application/domain/experience/opportunitySlot/data/repository";
import OpportunitySlotConverter from "@/application/domain/experience/opportunitySlot/data/converter";
import ReservationUseCase from "@/application/domain/experience/reservation/usecase";
import ReservationConverter from "@/application/domain/experience/reservation/data/converter";
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
import ImageService from "@/application/domain/content/image/service";
import NotificationService from "@/application/domain/notification/service";
import ArticleUseCase from "@/application/domain/content/article/usecase";
import OpportunityUseCase from "@/application/domain/experience/opportunity/usecase";
import OpportunityService from "@/application/domain/experience/opportunity/service";
import { ReservationRepository } from "@/application/domain/experience/reservation/data/repository";
import { ReservationService } from "@/application/domain/experience/reservation/service";

container.register("TransactionUseCase", { useClass: TransactionUseCase });
container.register("TransactionRepository", {
  useClass: TransactionRepository,
});
container.register("TransactionConverter", {
  useClass: TransactionConverter,
});
container.register("PrismaClientIssuer", { useClass: PrismaClientIssuer });
container.register("TransactionService", { useClass: TransactionService });

container.register("MembershipService", { useClass: MembershipService });
container.register("MembershipUseCase", { useClass: MembershipUseCase });
container.register("WalletService", { useClass: WalletService });
container.register("WalletValidator", { useClass: WalletValidator });

container.register("CommunityService", { useClass: CommunityService });
container.register("CommunityUseCase", { useClass: CommunityUseCase });
container.register("UserService", { useClass: UserService });
container.register("IdentityService", { useClass: IdentityService });
container.register("ImageService", { useClass: ImageService });
container.register("NotificationService", { useClass: NotificationService });

container.register("ArticleUseCase", { useClass: ArticleUseCase });

container.register("OpportunityUseCase", { useClass: OpportunityUseCase });
container.register("OpportunityService", { useClass: OpportunityService });
container.register("OpportunityRepository", { useClass: OpportunityRepository });

container.register("OpportunitySlotUseCase", { useClass: OpportunitySlotUseCase });
container.register("OpportunitySlotService", { useClass: OpportunitySlotService });
container.register("OpportunitySlotRepository", { useClass: OpportunitySlotRepository });
container.register("OpportunitySlotConverter", { useClass: OpportunitySlotConverter });

container.register("ReservationUseCase", { useClass: ReservationUseCase });
container.register("ReservationService", { useClass: ReservationService });
container.register("ReservationRepository", { useClass: ReservationRepository });
container.register("ReservationConverter", { useClass: ReservationConverter });
