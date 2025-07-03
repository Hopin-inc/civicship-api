import { container } from "tsyringe";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { NotFoundError } from "@/errors/graphql";
import { IContext } from "@/types/server";
import ICommunityConfigRepository from "@/application/domain/account/community/config/data/interface";

class MockCommunityConfigRepository implements ICommunityConfigRepository {
  getFirebaseConfig = jest.fn();
  getLineConfig = jest.fn();
  getLineRichMenuByType = jest.fn();
}

describe("CommunityConfigService", () => {
  let service: CommunityConfigService;
  let mockRepository: MockCommunityConfigRepository;
  let mockCtx: IContext;

  beforeEach(() => {
    mockRepository = new MockCommunityConfigRepository();
    container.registerInstance("CommunityConfigRepository", mockRepository);
    service = container.resolve(CommunityConfigService);
    mockCtx = {} as IContext;
    jest.clearAllMocks();
  });

  afterEach(() => {
    container.clearInstances();
    jest.restoreAllMocks();
  });

  describe("getFirebaseTenantId", () => {
    const communityId = "community-123";

    it("should return Firebase tenant ID when config exists", async () => {
      const mockConfig = {
        tenantId: "firebase-tenant-123",
      };

      mockRepository.getFirebaseConfig.mockResolvedValue(mockConfig);

      const result = await service.getFirebaseTenantId(mockCtx, communityId);

      expect(mockRepository.getFirebaseConfig).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toBe("firebase-tenant-123");
    });

    it("should throw NotFoundError when config is null", async () => {
      mockRepository.getFirebaseConfig.mockResolvedValue(null);

      await expect(service.getFirebaseTenantId(mockCtx, communityId)).rejects.toThrow(NotFoundError);
      await expect(service.getFirebaseTenantId(mockCtx, communityId)).rejects.toThrow(
        "Firebase tenantId not found"
      );

      expect(mockRepository.getFirebaseConfig).toHaveBeenCalledWith(mockCtx, communityId);
    });

    it("should throw NotFoundError when config exists but tenantId is null", async () => {
      const mockConfig = {
        tenantId: null,
      };

      mockRepository.getFirebaseConfig.mockResolvedValue(mockConfig);

      await expect(service.getFirebaseTenantId(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when config exists but tenantId is undefined", async () => {
      const mockConfig = {
        tenantId: undefined,
      };

      mockRepository.getFirebaseConfig.mockResolvedValue(mockConfig);

      await expect(service.getFirebaseTenantId(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when config exists but tenantId is empty string", async () => {
      const mockConfig = {
        tenantId: "",
      };

      mockRepository.getFirebaseConfig.mockResolvedValue(mockConfig);

      await expect(service.getFirebaseTenantId(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.getFirebaseConfig.mockRejectedValue(error);

      await expect(service.getFirebaseTenantId(mockCtx, communityId)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle empty community id", async () => {
      const mockConfig = {
        tenantId: "firebase-tenant-123",
      };

      mockRepository.getFirebaseConfig.mockResolvedValue(mockConfig);

      const result = await service.getFirebaseTenantId(mockCtx, "");

      expect(mockRepository.getFirebaseConfig).toHaveBeenCalledWith(mockCtx, "");
      expect(result).toBe("firebase-tenant-123");
    });
  });

  describe("getLineMessagingConfig", () => {
    const communityId = "community-123";

    it("should return complete LINE messaging config", async () => {
      const mockConfig = {
        channelId: "line-channel-123",
        channelSecret: "line-secret-456",
        accessToken: "line-access-token-789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      const result = await service.getLineMessagingConfig(mockCtx, communityId);

      expect(mockRepository.getLineConfig).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toEqual({
        channelId: "line-channel-123",
        channelSecret: "line-secret-456",
        accessToken: "line-access-token-789",
      });
    });

    it("should throw NotFoundError when config is null", async () => {
      mockRepository.getLineConfig.mockResolvedValue(null);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(
        "LINE Messaging Config is incomplete"
      );
    });

    it("should throw NotFoundError when channelId is missing", async () => {
      const mockConfig = {
        channelId: null,
        channelSecret: "line-secret-456",
        accessToken: "line-access-token-789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when channelSecret is missing", async () => {
      const mockConfig = {
        channelId: "line-channel-123",
        channelSecret: null,
        accessToken: "line-access-token-789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when accessToken is missing", async () => {
      const mockConfig = {
        channelId: "line-channel-123",
        channelSecret: "line-secret-456",
        accessToken: null,
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when channelId is empty string", async () => {
      const mockConfig = {
        channelId: "",
        channelSecret: "line-secret-456",
        accessToken: "line-access-token-789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when channelSecret is empty string", async () => {
      const mockConfig = {
        channelId: "line-channel-123",
        channelSecret: "",
        accessToken: "line-access-token-789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when accessToken is empty string", async () => {
      const mockConfig = {
        channelId: "line-channel-123",
        channelSecret: "line-secret-456",
        accessToken: "",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when multiple fields are missing", async () => {
      const mockConfig = {
        channelId: null,
        channelSecret: null,
        accessToken: "line-access-token-789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.getLineConfig.mockRejectedValue(error);

      await expect(service.getLineMessagingConfig(mockCtx, communityId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("getLiffConfig", () => {
    const communityId = "community-123";

    it("should return complete LIFF config", async () => {
      const mockConfig = {
        liffId: "liff-123456789",
        liffBaseUrl: "https://liff.line.me/123456789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      const result = await service.getLiffConfig(mockCtx, communityId);

      expect(mockRepository.getLineConfig).toHaveBeenCalledWith(mockCtx, communityId);
      expect(result).toEqual({
        liffId: "liff-123456789",
        liffBaseUrl: "https://liff.line.me/123456789",
      });
    });

    it("should throw NotFoundError when config is null", async () => {
      mockRepository.getLineConfig.mockResolvedValue(null);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(
        "LIFF Config is incomplete"
      );
    });

    it("should throw NotFoundError when liffId is missing", async () => {
      const mockConfig = {
        liffId: null,
        liffBaseUrl: "https://liff.line.me/123456789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when liffBaseUrl is missing", async () => {
      const mockConfig = {
        liffId: "liff-123456789",
        liffBaseUrl: null,
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when liffId is empty string", async () => {
      const mockConfig = {
        liffId: "",
        liffBaseUrl: "https://liff.line.me/123456789",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when liffBaseUrl is empty string", async () => {
      const mockConfig = {
        liffId: "liff-123456789",
        liffBaseUrl: "",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError when both fields are missing", async () => {
      const mockConfig = {
        liffId: null,
        liffBaseUrl: null,
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(NotFoundError);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.getLineConfig.mockRejectedValue(error);

      await expect(service.getLiffConfig(mockCtx, communityId)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle config with extra fields", async () => {
      const mockConfig = {
        liffId: "liff-123456789",
        liffBaseUrl: "https://liff.line.me/123456789",
        channelId: "extra-channel-id",
        channelSecret: "extra-secret",
      };

      mockRepository.getLineConfig.mockResolvedValue(mockConfig);

      const result = await service.getLiffConfig(mockCtx, communityId);

      expect(result).toEqual({
        liffId: "liff-123456789",
        liffBaseUrl: "https://liff.line.me/123456789",
      });
    });
  });

  describe("getLineRichMenuIdByType", () => {
    const communityId = "community-123";

    it("should return rich menu ID when menu exists", async () => {
      const mockMenu = {
        richMenuId: "richmenu-123456789",
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any);

      expect(mockRepository.getLineRichMenuByType).toHaveBeenCalledWith(mockCtx, communityId, "MEMBER");
      expect(result).toBe("richmenu-123456789");
    });

    it("should return null when menu does not exist", async () => {
      mockRepository.getLineRichMenuByType.mockResolvedValue(null);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any);

      expect(mockRepository.getLineRichMenuByType).toHaveBeenCalledWith(mockCtx, communityId, "MEMBER");
      expect(result).toBeNull();
    });

    it("should return null when menu exists but richMenuId is null", async () => {
      const mockMenu = {
        richMenuId: null,
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any);

      expect(result).toBeNull();
    });

    it("should return null when menu exists but richMenuId is undefined", async () => {
      const mockMenu = {
        richMenuId: undefined,
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any);

      expect(result).toBeNull();
    });

    it("should handle different menu types", async () => {
      const mockMenu = {
        richMenuId: "richmenu-owner-123",
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "OWNER" as any);

      expect(mockRepository.getLineRichMenuByType).toHaveBeenCalledWith(mockCtx, communityId, "OWNER");
      expect(result).toBe("richmenu-owner-123");
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.getLineRichMenuByType.mockRejectedValue(error);

      await expect(
        service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any)
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle empty community id", async () => {
      const mockMenu = {
        richMenuId: "richmenu-123456789",
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, "", "MEMBER" as any);

      expect(mockRepository.getLineRichMenuByType).toHaveBeenCalledWith(mockCtx, "", "MEMBER");
      expect(result).toBe("richmenu-123456789");
    });

    it("should return empty string as null", async () => {
      const mockMenu = {
        richMenuId: "",
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any);

      expect(result).toBe("");
    });

    it("should handle menu with extra fields", async () => {
      const mockMenu = {
        richMenuId: "richmenu-123456789",
        extraField: "extra-value",
        anotherField: 123,
      };

      mockRepository.getLineRichMenuByType.mockResolvedValue(mockMenu);

      const result = await service.getLineRichMenuIdByType(mockCtx, communityId, "MEMBER" as any);

      expect(result).toBe("richmenu-123456789");
    });
  });
});
