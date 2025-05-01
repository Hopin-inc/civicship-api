import "reflect-metadata";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { GqlCommunityCreateInput } from "@/types/graphql";
import { CurrentPrefecture } from "@prisma/client";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import CommunityUseCase from "@/application/domain/account/community/usecase";

describe("Community Integration Tests", () => {
  jest.setTimeout(30_000);
  let useCase: CommunityUseCase;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    container.reset();
    registerProductionDependencies();

    useCase = container.resolve(CommunityUseCase);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  describe("create community", () => {
    it("should create a member wallet if not existed", async () => {
      //////////////////////////////////////////////////
      // insert seed data
      //////////////////////////////////////////////////
      const name = "John Doe";
      const slug = "user-1-slug";
      const createUserInput = {
        name: name,
        slug: slug,
        image: undefined,
        currentPrefecture: CurrentPrefecture.KAGAWA,
      };
      const userInserted = await TestDataSourceHelper.createUser(createUserInput);
      const userId = userInserted.id;

      const ctx = { currentUser: { id: userId } } as unknown as IContext;

      //////////////////////////////////////////////////
      // construct request
      //////////////////////////////////////////////////
      const communityName = `community-${crypto.randomUUID().slice(0, 6)}`;
      const pointName = `${communityName}-point`;

      const createCommunityInput: GqlCommunityCreateInput = {
        name: communityName,
        pointName: pointName,
        image: undefined,
        bio: undefined,
        establishedAt: undefined,
        website: undefined,
      };

      //////////////////////////////////////////////////
      // execute
      //////////////////////////////////////////////////
      await useCase.userCreateCommunityAndJoin(
        {
          input: createCommunityInput,
        },
        ctx,
      );

      //////////////////////////////////////////////////
      // assert result
      //////////////////////////////////////////////////
      const communityActual = await TestDataSourceHelper.findAllCommunity();

      // communityが作成されていること
      expect(communityActual).toHaveLength(1);

      const communityId = communityActual[0].id;

      // community walletが作成されていること
      const communityWalletActual = await TestDataSourceHelper.findCommunityWallet(communityId);
      expect(communityWalletActual).toBeDefined();
    });
  });
});
