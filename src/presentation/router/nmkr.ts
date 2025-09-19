import express from "express";
import logger from "@/infrastructure/logging";
type NmkrWebhookPayload = {
  paymentTransactionUid: string;
  projectUid: string;
  state: string;
  paymentTransactionSubstate?: string;
  txHash?: string;
};
import crypto from "crypto";

const router = express();

const verifyHmacSignature = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const signature = req.headers['x-nmkr-signature'] as string;
  const hmacSecret = process.env.NMKR_WEBHOOK_HMAC_SECRET;
  
  if (hmacSecret && signature) {
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', hmacSecret)
      .update(body)
      .digest('hex');
    
    if (signature !== `sha256=${expectedSignature}`) {
      logger.warn('NMKR webhook signature verification failed', {
        expected: `sha256=${expectedSignature}`,
        received: signature
      });
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }
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
      txHash: payload.txHash
    });

    await processNmkrWebhook(payload);
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    logger.error("NMKR webhook processing error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function processNmkrWebhook(payload: NmkrWebhookPayload): Promise<void> {
  const { paymentTransactionUid, state, paymentTransactionSubstate, txHash } = payload;
  
  logger.info("Processing NMKR webhook", {
    paymentTransactionUid,
    state,
    substate: paymentTransactionSubstate,
    txHash
  });
  
  switch (state) {
    case "confirmed":
      logger.info("Payment confirmed", { paymentTransactionUid, txHash });
      break;
      
    case "finished":
      logger.info("Payment finished", { paymentTransactionUid, txHash });
      break;
      
    case "canceled":
    case "expired":
      logger.info("Payment canceled/expired", { paymentTransactionUid, state });
      break;
      
    default:
      logger.info("Payment state update", { paymentTransactionUid, state, paymentTransactionSubstate });
      break;
  }
}

export default router;
