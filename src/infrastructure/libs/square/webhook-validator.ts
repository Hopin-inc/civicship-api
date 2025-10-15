import { injectable } from "tsyringe";
import crypto from "crypto";
import { validateEnvironmentVariables } from "@/infrastructure/config/validation";

@injectable()
export class SquareWebhookValidator {
  private readonly webhookSecret: string;
  private readonly notificationUrl: string;

  constructor() {
    const config = validateEnvironmentVariables();
    this.webhookSecret = config.square.webhookSecret;
    this.notificationUrl = config.square.webhookNotificationUrl;
  }

  verify(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac("sha256", this.webhookSecret);
    hmac.update(payload + this.notificationUrl);
    const hash = hmac.digest("base64");
    return hash === signature;
  }
}
