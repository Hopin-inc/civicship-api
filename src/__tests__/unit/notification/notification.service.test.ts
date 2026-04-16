import "reflect-metadata";
import { container } from "tsyringe";
import { IContext } from "@/types/server";
import NotificationService from "@/application/domain/notification/service";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import UserService from "@/application/domain/account/user/service";
import { createLineClient } from "@/infrastructure/libs/line";
import logger from "@/infrastructure/logging";
import * as notificationLine from "@/application/domain/notification/line";

// Mock external dependencies
jest.mock("@/infrastructure/libs/line");
jest.mock("@/infrastructure/logging");
jest.mock("@/application/domain/notification/line");

describe("NotificationService - Point Transfer Notifications", () => {
  let notificationService: NotificationService;
  let mockCommunityConfigService: jest.Mocked<CommunityConfigService>;
  let mockUserService: jest.Mocked<UserService>;
  let mockLineClient: any;
  let mockTransactionFindUnique: jest.Mock;
  let mockTransactionFindMany: jest.Mock;

  const TEST_TRANSACTION_ID = "test-transaction-id";
  const TEST_USER_ID = "test-user-id";
  const TEST_COMMUNITY_ID = "test-community-id";
  const TEST_LINE_UID = "test-line-uid";
  const TEST_LIFF_URL = "https://liff.example.com";

  const buildDonationTransaction = (overrides: any = {}) => ({
    toPointChange: 100,
    comment: null,
    createdAt: new Date("2026-04-15T12:30:00Z"),
    images: [],
    fromWallet: {
      user: {
        name: "田中太郎",
        image: { url: "https://example.com/from.jpg" },
      },
      community: null,
    },
    toWallet: {
      user: {
        name: "佐藤花子",
        image: { url: "https://example.com/to.jpg" },
      },
    },
    ...overrides,
  });

  const buildGrantTransaction = (overrides: any = {}) => ({
    toPointChange: 200,
    comment: null,
    createdAt: new Date("2026-04-15T12:30:00Z"),
    images: [],
    fromWallet: {
      user: null,
      community: {
        name: "テストコミュニティ",
        image: { url: "https://example.com/community.jpg" },
      },
    },
    toWallet: {
      user: {
        name: "佐藤花子",
        image: { url: "https://example.com/to.jpg" },
      },
    },
    ...overrides,
  });

  const mockCtx = {
    currentUser: { id: "current-user-id", name: "Current User" },
    communityId: TEST_COMMUNITY_ID,
    issuer: {
      internal: jest.fn(async (cb: any) => {
        return cb({
          transaction: { findUnique: mockTransactionFindUnique },
        });
      }),
    },
  } as unknown as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    mockTransactionFindUnique = jest.fn();
    mockTransactionFindMany = jest.fn().mockResolvedValue([]);
    (mockCtx.issuer.internal as jest.Mock).mockImplementation(async (cb: any) => {
      return cb({
        transaction: {
          findUnique: mockTransactionFindUnique,
          findMany: mockTransactionFindMany,
        },
      });
    });

    // Mock CommunityConfigService
    mockCommunityConfigService = {
      getLiffConfig: jest.fn().mockResolvedValue({
        liffBaseUrl: TEST_LIFF_URL,
      }),
    } as any;

    // Mock UserService
    mockUserService = {
      findLineUidForCommunity: jest.fn().mockResolvedValue(TEST_LINE_UID),
      findLineUidAndLanguageForCommunity: jest
        .fn()
        .mockResolvedValue({ uid: TEST_LINE_UID, language: "JA" }),
    } as any;

    // Mock LINE client
    mockLineClient = {
      pushMessage: jest.fn().mockResolvedValue({}),
    };
    (createLineClient as jest.Mock).mockResolvedValue(mockLineClient);

    // Mock safePushMessage
    jest.spyOn(notificationLine, "safePushMessage").mockResolvedValue(true);

    // Register mocks
    container.register("CommunityConfigService", { useValue: mockCommunityConfigService });
    container.register("UserService", { useValue: mockUserService });

    notificationService = container.resolve(NotificationService);
  });

  describe("pushPointDonationReceivedMessage", () => {
    it("should send notification successfully when LINE UID exists", async () => {
      mockTransactionFindUnique.mockResolvedValue(buildDonationTransaction());

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidAndLanguageForCommunity).toHaveBeenCalledWith(
        mockCtx,
        TEST_USER_ID,
        TEST_COMMUNITY_ID,
      );

      expect(mockCommunityConfigService.getLiffConfig).toHaveBeenCalledWith(
        mockCtx,
        TEST_COMMUNITY_ID,
      );

      expect(createLineClient).toHaveBeenCalledWith(TEST_COMMUNITY_ID);

      expect(notificationLine.safePushMessage).toHaveBeenCalledWith(
        mockLineClient,
        expect.objectContaining({
          to: TEST_LINE_UID,
          messages: expect.arrayContaining([
            expect.objectContaining({
              type: "flex",
              altText: expect.stringContaining("田中太郎さんから"),
            }),
          ]),
        }),
      );
    });

    it("should not send notification when LINE UID is not found", async () => {
      mockUserService.findLineUidAndLanguageForCommunity.mockResolvedValue(undefined);

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidAndLanguageForCommunity).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        "pushPointDonationReceivedMessage: lineUid is missing",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          userId: TEST_USER_ID,
          communityId: TEST_COMMUNITY_ID,
        }),
      );
      expect(notificationLine.safePushMessage).not.toHaveBeenCalled();
    });

    it("should handle LIFF config fetch error gracefully", async () => {
      const error = new Error("LIFF config not found");
      mockCommunityConfigService.getLiffConfig.mockRejectedValue(error);

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(logger.error).toHaveBeenCalledWith(
        "pushPointDonationReceivedMessage: failed to get LIFF config",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          communityId: TEST_COMMUNITY_ID,
          err: error,
        }),
      );
      expect(notificationLine.safePushMessage).not.toHaveBeenCalled();
    });

    it("should not send notification when transaction is missing", async () => {
      mockTransactionFindUnique.mockResolvedValue(null);

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(logger.warn).toHaveBeenCalledWith(
        "pushPointDonationReceivedMessage: transaction not found",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          communityId: TEST_COMMUNITY_ID,
        }),
      );
      expect(notificationLine.safePushMessage).not.toHaveBeenCalled();
    });

    it("should include attached image in header when transaction has images", async () => {
      mockTransactionFindUnique.mockResolvedValue(
        buildDonationTransaction({
          images: [{ url: "https://example.com/photo.jpg" }],
        }),
      );

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      const pushMessageCall = (notificationLine.safePushMessage as jest.Mock).mock.calls[0];
      const message = pushMessageCall[1].messages[0];
      expect(message.contents.header).toBeDefined();
      const headerImage = message.contents.header.contents[0];
      expect(headerImage.url).toBe("https://example.com/photo.jpg");
    });

    it("should format redirect URL correctly", async () => {
      mockTransactionFindUnique.mockResolvedValue(buildDonationTransaction());

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      const pushMessageCall = (notificationLine.safePushMessage as jest.Mock).mock.calls[0];
      const params = pushMessageCall[1];
      const message = params.messages[0];
      const footer = message.contents.footer;
      const button = footer.contents[0];

      expect(button.action.uri).toBe(`${TEST_LIFF_URL}/wallets`);
    });

    it("should send carousel when recent transactions exist", async () => {
      mockTransactionFindUnique.mockResolvedValue(buildDonationTransaction());
      mockTransactionFindMany.mockResolvedValue([
        {
          reason: "DONATION",
          toPointChange: 300,
          createdAt: new Date("2026-04-14T10:00:00Z"),
          fromWallet: {
            user: { name: "山田太郎", image: { url: "https://example.com/yamada.jpg" } },
            community: null,
          },
          toWallet: {
            user: { name: "鈴木次郎", image: { url: "https://example.com/suzuki.jpg" } },
          },
        },
      ]);

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      const pushMessageCall = (notificationLine.safePushMessage as jest.Mock).mock.calls[0];
      const message = pushMessageCall[1].messages[0];
      expect(message.contents.type).toBe("carousel");
      // main(1) + recent(1) + viewMore(1) = 3
      expect(message.contents.contents).toHaveLength(3);
    });

    it("should send single bubble when no recent transactions", async () => {
      mockTransactionFindUnique.mockResolvedValue(buildDonationTransaction());
      mockTransactionFindMany.mockResolvedValue([]);

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      const pushMessageCall = (notificationLine.safePushMessage as jest.Mock).mock.calls[0];
      const message = pushMessageCall[1].messages[0];
      expect(message.contents.type).toBe("bubble");
    });
  });

  describe("pushPointGrantReceivedMessage", () => {
    it("should send notification successfully when LINE UID exists", async () => {
      mockTransactionFindUnique.mockResolvedValue(buildGrantTransaction());

      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidAndLanguageForCommunity).toHaveBeenCalledWith(
        mockCtx,
        TEST_USER_ID,
        TEST_COMMUNITY_ID,
      );

      expect(mockCommunityConfigService.getLiffConfig).toHaveBeenCalledWith(
        mockCtx,
        TEST_COMMUNITY_ID,
      );

      expect(createLineClient).toHaveBeenCalledWith(TEST_COMMUNITY_ID);

      expect(notificationLine.safePushMessage).toHaveBeenCalledWith(
        mockLineClient,
        expect.objectContaining({
          to: TEST_LINE_UID,
          messages: expect.arrayContaining([
            expect.objectContaining({
              type: "flex",
              altText: expect.stringContaining("テストコミュニティから"),
            }),
          ]),
        }),
      );
    });

    it("should not send notification when LINE UID is not found", async () => {
      mockUserService.findLineUidAndLanguageForCommunity.mockResolvedValue(undefined);

      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidAndLanguageForCommunity).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        "pushPointGrantReceivedMessage: lineUid is missing",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          userId: TEST_USER_ID,
          communityId: TEST_COMMUNITY_ID,
        }),
      );
      expect(notificationLine.safePushMessage).not.toHaveBeenCalled();
    });

    it("should handle LIFF config fetch error gracefully", async () => {
      const error = new Error("LIFF config not found");
      mockCommunityConfigService.getLiffConfig.mockRejectedValue(error);

      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      expect(logger.error).toHaveBeenCalledWith(
        "pushPointGrantReceivedMessage: failed to get LIFF config",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          communityId: TEST_COMMUNITY_ID,
          err: error,
        }),
      );
      expect(notificationLine.safePushMessage).not.toHaveBeenCalled();
    });

    it("should include attached image in header when transaction has images", async () => {
      mockTransactionFindUnique.mockResolvedValue(
        buildGrantTransaction({
          images: [{ url: "https://example.com/photo.jpg" }],
        }),
      );

      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      const pushMessageCall = (notificationLine.safePushMessage as jest.Mock).mock.calls[0];
      const message = pushMessageCall[1].messages[0];
      expect(message.contents.header).toBeDefined();
      const headerImage = message.contents.header.contents[0];
      expect(headerImage.url).toBe("https://example.com/photo.jpg");
    });

    it("should format redirect URL correctly", async () => {
      mockTransactionFindUnique.mockResolvedValue(buildGrantTransaction());

      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        TEST_USER_ID,
      );

      const pushMessageCall = (notificationLine.safePushMessage as jest.Mock).mock.calls[0];
      const params = pushMessageCall[1];
      const message = params.messages[0];
      const footer = message.contents.footer;
      const button = footer.contents[0];

      expect(button.action.uri).toBe(`${TEST_LIFF_URL}/wallets`);
    });
  });
});
