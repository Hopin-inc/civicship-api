import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import {
  GqlOpportunityInvitationCreateInput,
  GqlQueryOpportunityInvitationsArgs,
} from "@/types/graphql";
import OpportunityInvitationConverter from "@/application/invitation/data/converter";
import OpportunityInvitationRepository from "@/application/invitation/data/repository";
import OpportunityInvitationService from "@/application/invitation/service";
import { getCurrentUserId } from "@/application/utils";

jest.mock("@/infra/repositories/opportunity/invitation");
jest.mock("@/presentation/graphql/dto/opportunity/invitation/input");
jest.mock("@/utils");

describe("OpportunityInvitationService", () => {
  let ctx: IContext;
  let tx: Prisma.TransactionClient;

  beforeEach(() => {
    ctx = { user: { id: "test-user" } } as unknown as IContext;
    tx = {} as Prisma.TransactionClient;
    jest.clearAllMocks();
  });

  describe("fetchOpportunityInvitations", () => {
    it("should fetch opportunity invitations with filters and sorting", async () => {
      const mockResult = [{ id: "1", isValid: true }];
      const args: GqlQueryOpportunityInvitationsArgs = { filter: {}, sort: {}, cursor: undefined };
      const take = 10;

      (OpportunityInvitationConverter.filter as jest.Mock).mockReturnValue({});
      (OpportunityInvitationConverter.sort as jest.Mock).mockReturnValue([]);
      (OpportunityInvitationRepository.query as jest.Mock).mockResolvedValue(mockResult);

      await OpportunityInvitationService.fetchOpportunityInvitations(ctx, args);

      expect(OpportunityInvitationConverter.filter).toHaveBeenCalledWith({});
      expect(OpportunityInvitationConverter.sort).toHaveBeenCalledWith({});
      expect(OpportunityInvitationRepository.query).toHaveBeenCalledWith(
        ctx,
        {},
        [],
        take,
        undefined,
      );
    });
  });

  describe("findOpportunityInvitation", () => {
    it("should return an opportunity invitation by id", async () => {
      const mockResult = { id: "1", isValid: true };
      const id = "1";

      (OpportunityInvitationRepository.find as jest.Mock).mockResolvedValue(mockResult);

      const result = await OpportunityInvitationService.findOpportunityInvitation(ctx, id);

      expect(OpportunityInvitationRepository.find).toHaveBeenCalledWith(ctx, id);
      expect(result).toEqual(mockResult);
    });
  });

  describe("createOpportunityInvitation", () => {
    it("should create an opportunity invitation", async () => {
      const input: GqlOpportunityInvitationCreateInput = {
        code: "code123",
        opportunityId: "1",
      };
      const mockResult = {
        opportunityInvitation: {
          id: "1",
          code: "code123",
          opportunityId: "1",
          communityId: "community-1",
        },
      };

      const userId = "test-user";

      (getCurrentUserId as jest.Mock).mockReturnValue(userId);
      (OpportunityInvitationConverter.create as jest.Mock).mockReturnValue(input);
      (OpportunityInvitationRepository.create as jest.Mock).mockResolvedValue(mockResult);

      const result = await OpportunityInvitationService.createOpportunityInvitation(ctx, input, tx);

      expect(getCurrentUserId).toHaveBeenCalledWith(ctx);
      expect(OpportunityInvitationConverter.create).toHaveBeenCalledWith(userId, input);
      expect(OpportunityInvitationRepository.create).toHaveBeenCalledWith(ctx, input, tx);
      expect(result).toEqual(mockResult);
    });
  });

  describe("disableOpportunityInvitation", () => {
    it("should disable an opportunity invitation", async () => {
      const id = "1";
      const mockResult = {
        opportunityInvitation: {
          id: "1",
          code: "code123",
          opportunityId: "1",
          communityId: "community-1",
        },
      };

      (OpportunityInvitationRepository.disable as jest.Mock).mockResolvedValue(mockResult);

      const result = await OpportunityInvitationService.disableOpportunityInvitation(ctx, id, tx);

      expect(OpportunityInvitationRepository.disable).toHaveBeenCalledWith(ctx, id, false, tx);
      expect(result).toEqual(mockResult);
    });
  });
});
