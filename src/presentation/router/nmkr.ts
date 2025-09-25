import express from "express";
import logger from "@/infrastructure/logging";
import crypto from "crypto";
import { container } from "tsyringe";
import OrderUseCase from "@/application/domain/order/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";

type NmkrWebhookPayload = {
  paymentTransactionUid: string;
  projectUid: string;
  state: string;
  paymentTransactionSubstate?: string;
  txHash?: string;
  customProperty?: string;
};

const router = express();

const verifyHmacSignature = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (process.env.NODE_ENV !== "production") {
    logger.info("HMAC verification bypassed in development");
    next();
    return;
  }

  const signature = req.headers["x-nmkr-signature"] as string;
  const hmacSecret = process.env.NMKR_WEBHOOK_HMAC_SECRET;

  if (!hmacSecret) {
    logger.error("NMKR webhook HMAC secret not configured");
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  if (!signature) {
    logger.warn("NMKR webhook missing signature header");
    res.status(401).json({ error: "Missing signature" });
    return;
  }

  const body = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac("sha256", hmacSecret).update(body).digest("hex");
  const expectedSignatureWithPrefix = `sha256=${expectedSignature}`;

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignatureWithPrefix);

  if (signatureBuffer.length !== expectedBuffer.length) {
    logger.warn("NMKR webhook signature length mismatch", {
      receivedLength: signatureBuffer.length,
      expectedLength: expectedBuffer.length,
    });
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    logger.warn("NMKR webhook signature verification failed", {
      received: signature,
    });
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  next();
};

router.post("/webhook", verifyHmacSignature, async (req, res) => {
  try {
    const payload = req.body as NmkrWebhookPayload;

    logger.info("NMKR webhook received", {
      paymentTransactionUid: payload.paymentTransactionUid,
      projectUid: payload.projectUid,
      state: payload.state,
      substate: payload.paymentTransactionSubstate,
      txHash: payload.txHash,
    });

    const orderUseCase = container.resolve<OrderUseCase>("OrderUseCase");
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");
    
    const ctx = { issuer } as IContext;
    await orderUseCase.processNmkrWebhook(ctx, payload);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error("NMKR webhook processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
