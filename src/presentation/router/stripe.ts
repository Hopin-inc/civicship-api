import express from "express";
import { container } from "tsyringe";
import Stripe from "stripe";
import OrderWebhook from "@/application/domain/order/webhook";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { StripeClient } from "@/infrastructure/libs/stripe";

const router = express();

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      logger.error("Missing Stripe signature");
      return res.status(400).json({ error: "Missing signature" });
    }

    const stripeClient = container.resolve<StripeClient>("StripeClient");
    const event = stripeClient.constructWebhookEvent(req.body, signature as string);

    logger.info("Received Stripe webhook event", {
      type: event.type,
      id: event.id,
      created: event.created,
    });

    const orderWebhook = container.resolve<OrderWebhook>("OrderWebhook");
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

    let paymentTransactionUid: string;
    let state: string;
    let metadata: Stripe.Metadata = {};

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      paymentTransactionUid = session.payment_intent as string;
      state = "succeeded";
      metadata = session.metadata ?? {};
    } else if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      paymentTransactionUid = session.payment_intent as string;
      state = "payment_failed";
      metadata = session.metadata ?? {};
    } else if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      paymentTransactionUid = session.payment_intent as string;
      state = "expired";
      metadata = session.metadata ?? {};
    } else {
      logger.warn("Unhandled Stripe webhook event type", {
        eventType: event.type,
        eventId: event.id,
      });
      return res.status(200).json({
        received: true,
        message: `Event type ${event.type} not handled`,
      });
    }

    const ctx = { issuer } as IContext;
    await orderWebhook.processStripeWebhook(ctx, {
      id: paymentTransactionUid,
      state,
      metadata:
        Object.keys(metadata).length > 0
          ? {
              orderId: metadata.orderId,
              userId: metadata.userId,
              nmkrProjectUid: metadata.nmkrProjectUid,
              nmkrNftUid: metadata.nmkrNftUid,
              nftInstanceId: metadata.nftInstanceId,
            }
          : undefined,
    });

    logger.info("Successfully processed Stripe webhook", {
      eventType: event.type,
      eventId: event.id,
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Stripe webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && error.message.includes("signature")) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    return res.status(400).json({ error: "Webhook processing failed" });
  }
});

export default router;
