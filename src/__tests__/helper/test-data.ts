import {
  CurrentPrefecture,
  IdentityPlatform,
  Prisma,
  Role,
  TransactionReason,
} from "@prisma/client";
import { IContext } from "@/types/server";
import { GqlQueryUsersArgs } from "@/types/graphql";
import UserRepository from "@/application/domain/user/data/repository";
import IdentityRepository from "@/application/domain/user/identity/data/repository";
import TransactionRepository from "@/application/domain/transaction/data/repository";
import TransactionConverter from "@/application/domain/transaction/data/converter";
import { auth } from "@/infrastructure/libs/firebase";

// ユーザーテストデータ
export const TEST_USER_ID = "test-user";
export const TEST_USER_DATA = {
  name: "Test User",
  email: "test@example.com",
  slug: "test-user",
  currentPrefecture: CurrentPrefecture.KAGAWA,
};

export const TEST_USER = {
  id: TEST_USER_ID,
  ...TEST_USER_DATA,
  role: Role.MEMBER,
};

export const MOCK_USERS = [
  { id: "1", name: "User 1", email: "user1@example.com" },
  { id: "2", name: "User 2", email: "user2@example.com" },
];

export const DEFAULT_PAGINATION: GqlQueryUsersArgs = {
  cursor: "1",
  filter: {},
  sort: {},
};

export const COMMUNITY_PAGINATION: GqlQueryUsersArgs = {
  cursor: "1",
  filter: { keyword: "community-1" },
  sort: {},
};

export const DEFAULT_LIMIT = 2;

export const mockCtx = {
  currentUser: { id: TEST_USER_ID },
  uid: TEST_USER_ID,
} as IContext;

export const mockTx = {} as Prisma.TransactionClient;

// アイデンティティテストデータ
export const TEST_IDENTITY = {
  userId: "1",
  uid: "test-uid",
  platform: IdentityPlatform.LINE,
};

// トランザクションテストデータ
export const TRANSACTION_TEST_DATA = {
  fromWalletId: "wallet-from",
  toWalletId: "wallet-to",
  communityId: "community-1",
  userId: "user-1",
  walletId: "wallet-1",
  memberWalletId: "wallet-2",
  participationId: "participation-123",
  opportunityId: "opp-123",
  pointsToEarn: 100,
  pointChange: 200,
};

// トランザクション入力データの型定義
type IssueCommunityPointInput = {
  communityId: string;
  to: string;
  toWalletId: string;
  fromPointChange: number;
  toPointChange: number;
  reason: TransactionReason;
};

type GrantCommunityPointInput = {
  communityId: string;
  toPointChange: number;
  fromPointChange: number;
  fromWalletId: string;
  toWalletId: string;
  toUserId: string;
  reason: TransactionReason;
};

type DonateSelfPointInput = {
  communityId: string;
  toPointChange: number;
  fromPointChange: number;
  fromWalletId: string;
  toWalletId: string;
  toUserId: string;
};

type GiveOnboardingPointInput = {
  communityId: string;
  userId: string;
  toWalletId: string;
  fromWalletId: string;
  fromPointChange: number;
  toPointChange: number;
};

type GiveRewardPointInput = {
  fromWalletId: string;
  fromPointChange: number;
  toWalletId: string;
  toPointChange: number;
  participationId: string;
};

type PurchaseTicketInput = {
  userId: string;
  communityId: string;
  opportunityId: string;
  fromWalletId: string;
  toWalletId: string;
  fromPointChange: number;
  toPointChange: number;
  transferPoints: number;
};

export const TRANSACTION_INPUTS = {
  issueCommunityPoint: {
    communityId: TRANSACTION_TEST_DATA.communityId,
    to: TRANSACTION_TEST_DATA.userId,
    toWalletId: TRANSACTION_TEST_DATA.walletId,
    fromPointChange: TRANSACTION_TEST_DATA.pointChange,
    toPointChange: TRANSACTION_TEST_DATA.pointChange,
    reason: TransactionReason.POINT_ISSUED,
  } as IssueCommunityPointInput,

  grantCommunityPoint: {
    communityId: TRANSACTION_TEST_DATA.communityId,
    toPointChange: TRANSACTION_TEST_DATA.pointChange,
    fromPointChange: TRANSACTION_TEST_DATA.pointChange,
    fromWalletId: TRANSACTION_TEST_DATA.memberWalletId,
    toWalletId: TRANSACTION_TEST_DATA.walletId,
    toUserId: TRANSACTION_TEST_DATA.userId,
    reason: TransactionReason.GRANT,
  } as GrantCommunityPointInput,

  donateSelfPoint: {
    communityId: TRANSACTION_TEST_DATA.communityId,
    toPointChange: TRANSACTION_TEST_DATA.pointChange,
    fromPointChange: TRANSACTION_TEST_DATA.pointChange,
    fromWalletId: TRANSACTION_TEST_DATA.memberWalletId,
    toWalletId: TRANSACTION_TEST_DATA.walletId,
    toUserId: TRANSACTION_TEST_DATA.userId,
  } as DonateSelfPointInput,

  giveOnboardingPoint: {
    communityId: TRANSACTION_TEST_DATA.communityId,
    userId: TRANSACTION_TEST_DATA.userId,
    toWalletId: TRANSACTION_TEST_DATA.walletId,
    fromWalletId: TRANSACTION_TEST_DATA.memberWalletId,
    fromPointChange: TRANSACTION_TEST_DATA.pointChange,
    toPointChange: TRANSACTION_TEST_DATA.pointChange,
  } as GiveOnboardingPointInput,

  giveRewardPoint: {
    fromWalletId: TRANSACTION_TEST_DATA.fromWalletId,
    fromPointChange: -TRANSACTION_TEST_DATA.pointsToEarn,
    toWalletId: TRANSACTION_TEST_DATA.toWalletId,
    toPointChange: TRANSACTION_TEST_DATA.pointsToEarn,
    participationId: TRANSACTION_TEST_DATA.participationId,
  } as GiveRewardPointInput,

  purchaseTicket: {
    userId: TRANSACTION_TEST_DATA.userId,
    communityId: TRANSACTION_TEST_DATA.communityId,
    opportunityId: TRANSACTION_TEST_DATA.opportunityId,
    fromWalletId: TRANSACTION_TEST_DATA.fromWalletId,
    toWalletId: TRANSACTION_TEST_DATA.toWalletId,
    fromPointChange: TRANSACTION_TEST_DATA.pointChange,
    toPointChange: TRANSACTION_TEST_DATA.pointChange,
    transferPoints: TRANSACTION_TEST_DATA.pointChange,
  } as PurchaseTicketInput,
};

type TransactionResult = Prisma.TransactionGetPayload<{
  select: {
    id: true;
    createdAt: true;
    updatedAt: true;
    reason: true;
    participationId: true;
    from: true;
    fromPointChange: true;
    to: true;
    toPointChange: true;
  };
}>;

export const mockFunctions = {
  // ユーザー関連
  find: (result: typeof TEST_USER | null) =>
    (UserRepository.find as jest.Mock).mockResolvedValue(result),

  query: (result: typeof MOCK_USERS) =>
    (UserRepository.query as jest.Mock).mockResolvedValue(result),

  updateProfile: (result: typeof TEST_USER | Promise<never>) =>
    (UserRepository.updateProfile as jest.Mock).mockResolvedValue(result),

  // アイデンティティ関連
  createWithIdentity: (result: typeof TEST_USER) =>
    (UserRepository.createWithIdentity as jest.Mock).mockResolvedValue(result),

  findIdentity: (result: typeof TEST_IDENTITY | null) =>
    (IdentityRepository.find as jest.Mock).mockResolvedValue(result),

  deleteWithIdentity: (result: typeof TEST_USER) =>
    (UserRepository.deleteWithIdentity as jest.Mock).mockResolvedValue(result),

  deleteFirebaseUser: () => (auth.deleteUser as jest.Mock).mockResolvedValue(undefined),

  // トランザクション関連
  createTransaction: (result: TransactionResult) => {
    (TransactionRepository.create as jest.Mock).mockResolvedValue(result);
  },
  refreshCurrentPoints: () => {
    (TransactionRepository.refreshCurrentPoints as jest.Mock).mockResolvedValue(undefined);
  },
  convertIssueCommunityPoint: (input: Prisma.TransactionCreateInput) => {
    (TransactionConverter.issueCommunityPoint as jest.Mock).mockReturnValue(input);
  },
  convertGrantCommunityPoint: (input: Prisma.TransactionCreateInput) => {
    (TransactionConverter.grantCommunityPoint as jest.Mock).mockReturnValue(input);
  },
  convertDonateSelfPoint: (input: Prisma.TransactionCreateInput) => {
    (TransactionConverter.donateSelfPoint as jest.Mock).mockReturnValue(input);
  },
  convertGiveOnboardingPoint: (input: Prisma.TransactionCreateInput) => {
    (TransactionConverter.giveOnboardingPoint as jest.Mock).mockReturnValue(input);
  },
  convertGiveRewardPoint: (input: Prisma.TransactionCreateInput) => {
    (TransactionConverter.giveRewardPoint as jest.Mock).mockReturnValue(input);
  },
  convertPurchaseTicket: (input: Prisma.TransactionCreateInput) => {
    (TransactionConverter.purchaseTicket as jest.Mock).mockReturnValue(input);
  },

  // 異常系のモック関数
  rejectCreateTransaction: (error: Error) => {
    (TransactionRepository.create as jest.Mock).mockRejectedValue(error);
  },
  rejectRefreshCurrentPoints: (error: Error) => {
    (TransactionRepository.refreshCurrentPoints as jest.Mock).mockRejectedValue(error);
  },
  rejectConvertIssueCommunityPoint: (error: Error) => {
    (TransactionConverter.issueCommunityPoint as jest.Mock).mockRejectedValue(error);
  },
  rejectConvertGrantCommunityPoint: (error: Error) => {
    (TransactionConverter.grantCommunityPoint as jest.Mock).mockRejectedValue(error);
  },
  rejectConvertDonateSelfPoint: (error: Error) => {
    (TransactionConverter.donateSelfPoint as jest.Mock).mockRejectedValue(error);
  },
  rejectConvertGiveOnboardingPoint: (error: Error) => {
    (TransactionConverter.giveOnboardingPoint as jest.Mock).mockRejectedValue(error);
  },
  rejectConvertGiveRewardPoint: (error: Error) => {
    (TransactionConverter.giveRewardPoint as jest.Mock).mockRejectedValue(error);
  },
  rejectConvertPurchaseTicket: (error: Error) => {
    (TransactionConverter.purchaseTicket as jest.Mock).mockRejectedValue(error);
  },
};
