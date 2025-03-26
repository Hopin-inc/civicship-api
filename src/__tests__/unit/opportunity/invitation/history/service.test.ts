import { IContext } from "@/types/server";
import { GqlQueryOpportunityInvitationHistoriesArgs } from "@/types/graphql";
import OpportunityInvitationHistoryConverter from "@/application/domain/invitation/invitationHistory/data/converter";
import OpportunityInvitationHistoryRepository from "@/application/domain/invitation/invitationHistory/data/repository";
import OpportunityInvitationHistoryService from "@/application/domain/invitation/invitationHistory/service";

jest.mock("@/infra/repositories/opportunity/invitation/history");
jest.mock("@/presentation/graphql/dto/opportunity/invitation/history/input");

describe("OpportunityInvitationHistoryService", () => {
  let ctx: IContext;

  beforeEach(() => {
    ctx = { user: { id: "test-user" } } as unknown as IContext;
    jest.clearAllMocks();
  });

  describe("fetchInvitationHistories", () => {
    it("should fetch invitation histories with filters and sorting", async () => {
      const mockResult = [{ id: "1", status: "SENT" }];
      const args: GqlQueryOpportunityInvitationHistoriesArgs = {
        filter: {},
        sort: {},
        cursor: undefined,
      };
      const take = 10;

      (OpportunityInvitationHistoryConverter.filter as jest.Mock).mockReturnValue({});
      (OpportunityInvitationHistoryConverter.sort as jest.Mock).mockReturnValue([]);
      (OpportunityInvitationHistoryRepository.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await OpportunityInvitationHistoryService.fetchInvitationHistories(
        ctx,
        args,
        take,
      );

      expect(OpportunityInvitationHistoryConverter.filter).toHaveBeenCalledWith({});
      expect(OpportunityInvitationHistoryConverter.sort).toHaveBeenCalledWith({});
      expect(OpportunityInvitationHistoryRepository.query).toHaveBeenCalledWith(
        ctx,
        {},
        [],
        take,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("findInvitationHistory", () => {
    it("should return an invitation history by id", async () => {
      const mockResult = { id: "1", status: "SENT" };
      const id = "1";

      (OpportunityInvitationHistoryRepository.find as jest.Mock).mockResolvedValue(mockResult);

      const result = await OpportunityInvitationHistoryService.findInvitationHistory(ctx, id);

      expect(OpportunityInvitationHistoryRepository.find).toHaveBeenCalledWith(ctx, id);
      expect(result).toEqual(mockResult);
    });
  });
});
