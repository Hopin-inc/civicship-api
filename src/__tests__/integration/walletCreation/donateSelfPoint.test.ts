import "reflect-metadata";
import { GqlCommunityCreateInput } from "@/types/graphql";
import TestDataSourceHelper from "../../helper/test-data-source-helper";
import { IContext } from "@/types/server";
import { CurrentPrefecture, TransactionReason, WalletType } from "@prisma/client";
import { container } from "tsyringe";
import { registerProductionDependencies } from "@/application/provider";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import CommunityConverter from "@/application/domain/account/community/data/converter";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";

describe("Transaction DonateSelfPoint Integration Tests", () => {
  jest.setTimeout(30_000);
  let useCase: TransactionUseCase;
  let communityConverter: CommunityConverter;
  let issuer: PrismaClientIssuer;

  beforeEach(async () => {
    await TestDataSourceHelper.deleteAll();
    jest.clearAllMocks();

    container.reset();
    registerProductionDependencies();

    useCase = container.resolve(TransactionUseCase);
    communityConverter = container.resolve(CommunityConverter);
    issuer = container.resolve(PrismaClientIssuer);
  });

  afterAll(async () => {
    await TestDataSourceHelper.disconnect();
  });

  it("should create member wallet if not exists when donate self points", async () => {
    const name = "John Doe";
    const slug = "user-1-slug";
    const createUserInput = {
      name: name,
      slug: slug,
      image: undefined,
      currentPrefecture: CurrentPrefecture.KAGAWA,
    };
    const fromUserInserted = await TestDataSourceHelper.createUser(createUserInput);
    const fromUserId = fromUserInserted.id;

    const toUserInserted = await TestDataSourceHelper.createUser(createUserInput);
    const toUserId = toUserInserted.id;

    const ctx = {
      uid: fromUserId,
      currentUser: { id: fromUserId },
      issuer,
    } as unknown as IContext;

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
    const prismaCreateInput = communityConverter.create(createCommunityInput, ctx.uid!);
    const communityInserted = await TestDataSourceHelper.createCommunity(prismaCreateInput.data);
    const communityId = communityInserted.id;

    const createFromMemberWalletInput = {
      type: WalletType.MEMBER,
      community: { connect: { id: communityId } },
      user: { connect: { id: fromUserId } },
    };
    const fromMemberWalletInserted = await TestDataSourceHelper.createWallet(
      createFromMemberWalletInput,
    );
    const fromMemberWalletId = fromMemberWalletInserted.id;

    const createTransactionInput = {
      to: fromMemberWalletId,
      toPointChange: 100,
      fromPointChange: 100,
      reason: TransactionReason.GRANT,
    };
    await TestDataSourceHelper.createTransaction(createTransactionInput);

    await TestDataSourceHelper.refreshCurrentPoints();

    const donatedPoints = 100;
    const input = {
      communityId: communityId,
      fromWalletId: fromMemberWalletId,
      toUserId: toUserId,
      transferPoints: donatedPoints,
    };

    await useCase.userDonateSelfPointToAnother(ctx, { 
      input,
      permission: { userId: ctx.currentUser!.id }
    });

    const transactions = await TestDataSourceHelper.findAllTransactions();
    const transactionActual = transactions.find((t) => t.reason === TransactionReason.DONATION);

    const toMemberWalletActual = await TestDataSourceHelper.findMemberWallet(toUserId);
    expect(toMemberWalletActual).toBeDefined();
    expect(transactionActual?.to).toEqual(toMemberWalletActual?.id);
  });
});
