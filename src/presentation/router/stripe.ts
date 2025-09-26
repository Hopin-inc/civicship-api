import express from "express";
import logger from "@/infrastructure/logging";
import crypto from "crypto";
import { container } from "tsyringe";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { GqlPaymentProvider } from "@/types/graphql";
import OrderWebhook from "@/application/domain/order/webhook";

type StripeWebhookPayload = {
  id: string;
  object: string;
  type: string;
  data: {
    object: {
      id: string;
      object: string;
      status?: string;
      metadata?: Record<string, string>;
    };
  };
  created: number;
};

const router = express();

const verifyStripeSignature = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (process.env.ENV === "LOCAL") {
    logger.info("Stripe signature verification bypassed in development");
    next();
    return;
  }

  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error("Stripe webhook secret not configured");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  if (!signature) {
    logger.warn("Stripe webhook missing signature header");
    res.status(401).json({ error: "Missing signature" });
    return;
  }

  const body = JSON.stringify(req.body);
  const elements = signature.split(",");
  const signatureHash = elements.find((element) => element.startsWith("v1="));

  if (!signatureHash) {
    logger.warn("Stripe webhook invalid signature format");
    res.status(401).json({ error: "Invalid signature format" });
    return;
  }

  const timestamp = elements.find((element) => element.startsWith("t="));
  if (!timestamp) {
    logger.warn("Stripe webhook missing timestamp");
    res.status(401).json({ error: "Missing timestamp" });
    return;
  }

  const timestampValue = timestamp.split("=")[1];
  const payload = `${timestampValue}.${body}`;
  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");
  const expectedSignatureWithPrefix = `v1=${expectedSignature}`;

  const signatureBuffer = Buffer.from(signatureHash);
  const expectedBuffer = Buffer.from(expectedSignatureWithPrefix);

  if (signatureBuffer.length !== expectedBuffer.length) {
    logger.warn("Stripe webhook signature length mismatch", {
      receivedLength: signatureBuffer.length,
      expectedLength: expectedBuffer.length,
    });
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    logger.warn("Stripe webhook signature verification failed");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  next();
};

router.post("/webhook", verifyStripeSignature, async (req, res) => {
  try {
    const payload = req.body as StripeWebhookPayload;

    logger.info("Stripe webhook received", {
      eventId: payload.id,
      eventType: payload.type,
      objectId: payload.data.object.id,
      objectType: payload.data.object.object,
      status: payload.data.object.status,
    });

    const orderWebhook = container.resolve<OrderWebhook>("OrderWebhook");
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

    const ctx = { issuer } as IContext;
    await orderWebhook.processWebhook(ctx, {
      provider: GqlPaymentProvider.Stripe,
      projectUid: payload.data.object.id,
      paymentTransactionUid: payload.data.object.id,
      state: payload.data.object.status || "unknown",
      customProperty: JSON.stringify(payload.data.object.metadata || {}),
    });

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("Stripe webhook processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
