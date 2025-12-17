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

  const TEST_TRANSACTION_ID = "test-transaction-id";
  const TEST_USER_ID = "test-user-id";
  const TEST_COMMUNITY_ID = "test-community-id";
  const TEST_LINE_UID = "test-line-uid";
  const TEST_LIFF_URL = "https://liff.example.com";

  const mockCtx = {
    currentUser: { id: "current-user-id", name: "Current User" },
    communityId: TEST_COMMUNITY_ID,
  } as IContext;

  beforeEach(() => {
    jest.clearAllMocks();
    container.reset();

    // Mock CommunityConfigService
    mockCommunityConfigService = {
      getLiffConfig: jest.fn().mockResolvedValue({
        liffBaseUrl: TEST_LIFF_URL,
      }),
    } as any;

    // Mock UserService
    mockUserService = {
      findLineUidForCommunity: jest.fn().mockResolvedValue(TEST_LINE_UID),
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
      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        100,
        "ありがとうございます！",
        "田中太郎",
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidForCommunity).toHaveBeenCalledWith(
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
      mockUserService.findLineUidForCommunity.mockResolvedValue(undefined);

      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        100,
        null,
        "田中太郎",
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidForCommunity).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        "pushPointDonationReceivedMessage: lineUid is missing",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          toUserId: TEST_USER_ID,
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
        100,
        null,
        "田中太郎",
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

    it("should send notification with null comment", async () => {
      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        100,
        null,
        "田中太郎",
        TEST_USER_ID,
      );

      expect(notificationLine.safePushMessage).toHaveBeenCalledWith(
        mockLineClient,
        expect.objectContaining({
          to: TEST_LINE_UID,
          messages: expect.arrayContaining([
            expect.objectContaining({
              type: "flex",
            }),
          ]),
        }),
      );
    });

    it("should format redirect URL correctly", async () => {
      await notificationService.pushPointDonationReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        100,
        null,
        "田中太郎",
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

  describe("pushPointGrantReceivedMessage", () => {
    it("should send notification successfully when LINE UID exists", async () => {
      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        200,
        "イベント参加ありがとうございます",
        "テストコミュニティ",
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidForCommunity).toHaveBeenCalledWith(
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
      mockUserService.findLineUidForCommunity.mockResolvedValue(undefined);

      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        200,
        null,
        "テストコミュニティ",
        TEST_USER_ID,
      );

      expect(mockUserService.findLineUidForCommunity).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        "pushPointGrantReceivedMessage: lineUid is missing",
        expect.objectContaining({
          transactionId: TEST_TRANSACTION_ID,
          toUserId: TEST_USER_ID,
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
        200,
        null,
        "テストコミュニティ",
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

    it("should send notification with null comment", async () => {
      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        200,
        null,
        "テストコミュニティ",
        TEST_USER_ID,
      );

      expect(notificationLine.safePushMessage).toHaveBeenCalledWith(
        mockLineClient,
        expect.objectContaining({
          to: TEST_LINE_UID,
          messages: expect.arrayContaining([
            expect.objectContaining({
              type: "flex",
            }),
          ]),
        }),
      );
    });

    it("should format redirect URL correctly", async () => {
      await notificationService.pushPointGrantReceivedMessage(
        mockCtx,
        TEST_TRANSACTION_ID,
        200,
        null,
        "テストコミュニティ",
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