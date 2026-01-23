import "reflect-metadata";
import { buildSignupBonusGrantedMessage } from "@/application/domain/notification/presenter/message/signupBonusGrantedMessage";

// Language enum (since Prisma types may not be available)
const Language = {
  JA: "JA" as const,
  EN: "EN" as const,
};

describe("buildSignupBonusGrantedMessage", () => {
  const communityName = "Test Community";
  const transferPoints = 100;

  describe("Japanese messages", () => {
    it("should use custom message when comment is provided", () => {
      const customMessage = "ようこそ！特別ボーナスです。";
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: customMessage,
        language: Language.JA,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(customMessage);
    });

    it("should use default message when comment is null", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: null,
        language: Language.JA,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(`${communityName}への参加おめでとうございます🎉 100ポイントを獲得しました！`);
    });

    it("should use default message when comment is empty string", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: "",
        language: Language.JA,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(`${communityName}への参加おめでとうございます🎉 100ポイントを獲得しました！`);
    });

    it("should use default message when comment is whitespace only", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: "   ",
        language: Language.JA,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(`${communityName}への参加おめでとうございます🎉 100ポイントを獲得しました！`);
    });

    it("should format large numbers with comma separators", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints: 10000,
        comment: null,
        language: Language.JA,
      });

      expect(result.text).toContain("10,000ポイント");
    });

    it("should trim whitespace from custom message", () => {
      const customMessage = "  メッセージ  ";
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: customMessage,
        language: Language.JA,
      });

      expect(result.text).toBe("メッセージ");
    });
  });

  describe("English messages", () => {
    it("should use custom message when comment is provided", () => {
      const customMessage = "Welcome! This is a special bonus.";
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: customMessage,
        language: Language.EN,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(customMessage);
    });

    it("should use default message when comment is null", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: null,
        language: Language.EN,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(`Welcome to ${communityName} 🎉 You received 100 points!`);
    });

    it("should use default message when comment is empty string", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: "",
        language: Language.EN,
      });

      expect(result.type).toBe("text");
      expect(result.text).toBe(`Welcome to ${communityName} 🎉 You received 100 points!`);
    });

    it("should format large numbers with comma separators", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints: 10000,
        comment: null,
        language: Language.EN,
      });

      expect(result.text).toContain("10,000 points");
    });
  });

  describe("Edge cases", () => {
    it("should handle zero points", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints: 0,
        comment: null,
        language: Language.JA,
      });

      expect(result.text).toContain("0ポイント");
    });

    it("should handle negative points", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints: -100,
        comment: null,
        language: Language.JA,
      });

      expect(result.text).toContain("-100ポイント");
    });

    it("should handle very large numbers", () => {
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints: 999999999,
        comment: null,
        language: Language.JA,
      });

      expect(result.text).toContain("999,999,999ポイント");
    });

    it("should handle special characters in community name", () => {
      const specialCommunityName = "Test & <Community>";
      const result = buildSignupBonusGrantedMessage({
        communityName: specialCommunityName,
        transferPoints,
        comment: null,
        language: Language.JA,
      });

      expect(result.text).toContain(specialCommunityName);
    });

    it("should handle multiline custom message", () => {
      const multilineMessage = "Line 1\nLine 2\nLine 3";
      const result = buildSignupBonusGrantedMessage({
        communityName,
        transferPoints,
        comment: multilineMessage,
        language: Language.JA,
      });

      expect(result.text).toBe(multilineMessage);
    });
  });
});
