import express from "express";
import { container } from "tsyringe";
import OrderWebhook from "@/application/domain/order/webhook";
import logger from "@/infrastructure/logging";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { IContext } from "@/types/server";
import { SquareWebhookValidator } from "@/infrastructure/libs/square/webhook-validator";

const router = express();

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-square-hmacsha256-signature"];
    if (!signature) {
      logger.error("Missing Square signature");
      return res.status(400).json({ error: "Missing signature" });
    }

    const validator = container.resolve<SquareWebhookValidator>("SquareWebhookValidator");
    const isValid = validator.verify(req.body.toString(), signature as string);
    
    if (!isValid) {
      logger.warn("Security event detected", {
        type: "webhook_signature_failure",
        source: "square",
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'],
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    logger.info("Received Square webhook event", {
      type: event.type,
      id: event.event_id,
      created: event.created_at,
    });

    const orderWebhook = container.resolve<OrderWebhook>("OrderWebhook");
    const issuer = container.resolve<PrismaClientIssuer>("PrismaClientIssuer");

    let paymentId: string | undefined;
    let state: string | undefined;
    let orderId: string | undefined;

    switch (event.type) {
      case "payment.created":
      case "payment.updated": {
        const payment = event.data?.object?.payment;
        if (!payment) {
          logger.warn("No payment object in Square webhook", {
            eventType: event.type,
            eventId: event.event_id,
          });
          return res.status(200).json({
            received: true,
            message: "No payment data",
          });
        }

        paymentId = payment.id;
        orderId = payment.order_id;

        switch (payment.status) {
          case "COMPLETED":
            state = "succeeded";
            break;
          case "FAILED":
            state = "payment_failed";
            break;
          case "CANCELED":
            state = "canceled";
            break;
          default:
            logger.info("Unhandled Square payment status", {
              status: payment.status,
              paymentId,
            });
            return res.status(200).json({
              received: true,
              message: `Payment status ${payment.status} not handled`,
            });
        }
        break;
      }

      default: {
        logger.warn("Unhandled Square webhook event type", {
          eventType: event.type,
          eventId: event.event_id,
        });
        return res.status(200).json({
          received: true,
          message: `Event type ${event.type} not handled`,
        });
      }
    }

    if (!paymentId || !state) {
      logger.error("Missing paymentId or state after event processing", {
        eventType: event.type,
        paymentId,
        state,
      });
      return res.status(200).json({ received: true });
    }

    const ctx = { issuer } as IContext;
    await orderWebhook.processSquareWebhook(ctx, {
      id: paymentId,
      state,
      orderId,
    });

    logger.info("Successfully processed Square webhook", {
      eventType: event.type,
      eventId: event.event_id,
      paymentId,
      state,
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    logger.error("Square webhook processing failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(200).json({ received: true });
  }
});

export default router;
