import { Request, Response, NextFunction } from "express";
import { botBlocker } from "@/presentation/middleware/bot-blocker";

function makeReq(userAgent: string | undefined): Partial<Request> {
  return {
    headers: userAgent !== undefined ? { "user-agent": userAgent } : {},
    originalUrl: "/graphql",
  };
}

function makeRes(): { res: Partial<Response>; statusCode: number | undefined; body: unknown } {
  const ctx: { statusCode: number | undefined; body: unknown } = {
    statusCode: undefined,
    body: undefined,
  };
  const res: Partial<Response> = {
    status: jest.fn().mockImplementation((code: number) => {
      ctx.statusCode = code;
      return res;
    }),
    json: jest.fn().mockImplementation((data: unknown) => {
      ctx.body = data;
      return res;
    }),
  };
  return { res, ...ctx };
}

describe("botBlocker", () => {
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    next = jest.fn();
  });

  describe("既知の Bot UA", () => {
    const botUAs = [
      ["Googlebot/2.1", "Googlebot"],
      ["Mozilla/5.0 (compatible; Bingbot/2.0)", "Bingbot"],
      ["facebookexternalhit/1.1", "Facebook Bot"],
      ["Twitterbot/1.0", "Twitterbot"],
      ["Slackbot-LinkExpanding 1.0", "Slackbot"],
      ["Mozilla/5.0 (compatible; Discordbot/2.0)", "Discordbot"],
      ["TelegramBot (like TwitterBot)", "TelegramBot"],
      ["Mozilla/5.0 (compatible; SomeCrawler/1.0)", "Unknown Bot"],
    ] as const;

    test.each(botUAs)("UA=%s → 403 を返し next() を呼ばない", (ua) => {
      const req = makeReq(ua);
      const { res, statusCode } = makeRes();

      botBlocker(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Bot access blocked" });
      expect(next).not.toHaveBeenCalled();
      expect(statusCode).toBe(403);
    });
  });

  describe("通常のブラウザ UA", () => {
    const normalUAs = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    ];

    test.each(normalUAs)("UA=%s → next() を呼ぶ", (ua) => {
      const req = makeReq(ua);
      const { res } = makeRes();

      botBlocker(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("エッジケース", () => {
    it("User-Agent ヘッダーがない場合は next() を呼ぶ", () => {
      const req = makeReq(undefined);
      const { res } = makeRes();

      botBlocker(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("User-Agent が配列の場合、先頭要素で判定する", () => {
      // 配列の先頭が Bot UA → ブロック
      // Express の IncomingHttpHeaders は user-agent を string | undefined としか定義しないが、
      // Node.js の HTTP パーサーは実際に配列を返すケースがあるため unknown 経由でキャストする
      const req = {
        headers: { "user-agent": ["Googlebot/2.1", "Mozilla/5.0"] },
        originalUrl: "/graphql",
      } as unknown as Request;
      const { res } = makeRes();

      botBlocker(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it("User-Agent が空文字の場合は next() を呼ぶ", () => {
      const req = makeReq("");
      const { res } = makeRes();

      botBlocker(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
