import { Request, Response, NextFunction } from "express";

/**
 * apiKeyAuthMiddleware の後段で利用。
 * ApiKey に NftVendor が紐付いていない場合は 403 を返す。
 * NFT 連携用エンドポイント (PUT /api/nft-tokens/..., PUT /api/nft-tokens/.../instances/...)
 * は vendor が確定していないと認可判定できないため。
 */
export function requireApiKeyVendor(req: Request, res: Response, next: NextFunction) {
  const apiKey = (req as any).apiKey;
  if (!apiKey?.vendor) {
    res.status(403).json({ error: "API key is not associated with a vendor" });
    return;
  }
  next();
}
