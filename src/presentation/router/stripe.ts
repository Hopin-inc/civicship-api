import express from "express";
import { container } from "tsyringe";
import Stripe from "stripe";
import { GqlPaymentProvider } from "@/types/graphql";
import OrderWebhook from "@/application/domain/order/webhook";
import { StripeClient } from "@/infrastructure/libs/stripe/api";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";

const router = express();

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !endpointSecret) {
      logger.error("Missing Stripe signature or webhook secret");
      return res.status(400).json({ error: "Missing signature or webhook secret" });
    }

    const stripeClient = container.resolve<StripeClient>("StripeClient");
    const event = stripeClient.constructWebhookEvent(req.body, signature as string, endpointSecret);

    logger.info("Received Stripe webhook event", {
      type: event.type,
      id: event.id,
      created: event.created,
    });

    const orderWebhook = container.resolve<OrderWebhook>("OrderWebhook");
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

    let projectUid: string;
    let paymentTransactionUid: string;
    let state: string;
    let metadata: Stripe.Metadata = {};

    if (event.type.startsWith('payment_intent.')) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      projectUid = paymentIntent.id;
      paymentTransactionUid = paymentIntent.id;
      state = paymentIntent.status;
      metadata = paymentIntent.metadata;
    } else {
      projectUid = event.id;
      paymentTransactionUid = event.id;
      state = "unknown";
    }

    const ctx = { issuer } as IContext;
    await orderWebhook.processWebhook(ctx, {
      provider: GqlPaymentProvider.Stripe,
      projectUid,
      paymentTransactionUid,
      state,
      customProperty: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : undefined,
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
