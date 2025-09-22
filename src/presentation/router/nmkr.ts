import express from "express";
import logger from "@/infrastructure/logging";
import { parseCustomProps } from "@/application/domain/nmkr/customProps";
import crypto from "crypto";
import { container } from "tsyringe";
import NmkrWebhookService from "@/application/domain/nmkr/webhookService";
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

const verifyHmacSignature = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('HMAC verification bypassed in development');
    next();
    return;
  }

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
  const { paymentTransactionUid, state, paymentTransactionSubstate, txHash, customProperty } = payload;
  
  logger.info("Processing NMKR webhook", {
    paymentTransactionUid,
    state,
    substate: paymentTransactionSubstate,
    txHash
  });

  if (!customProperty) {
    logger.warn("NMKR webhook missing customProperty", { paymentTransactionUid });
    return;
  }
  
  const customPropsResult = parseCustomProps(customProperty);
  if (!customPropsResult.success) {
    logger.error("NMKR webhook invalid customProperty", { 
      paymentTransactionUid, 
      error: customPropsResult.error 
    });
    return;
  }
  
  const { nftMintId } = customPropsResult.data;
  if (!nftMintId) {
    logger.warn("NMKR webhook missing nftMintId in customProperty", { paymentTransactionUid });
    return;
  }

  logger.info("Processing state transition", {
    nftMintId,
    paymentTransactionUid,
    state,
    txHash
  });

  try {
    const webhookService = container.resolve<NmkrWebhookService>("NmkrWebhookService");
    const prismaClientIssuer = container.resolve("PrismaClientIssuer");
    const mockContext = {
      issuer: prismaClientIssuer,
      user: { id: 'system', role: 'SYSTEM' }
    } as unknown as IContext;
    
    await webhookService.processStateTransition(
      mockContext,
      nftMintId,
      state,
      txHash,
      paymentTransactionUid
    );
    
    logger.info("State transition processed successfully", {
      nftMintId,
      paymentTransactionUid,
      state
    });
  } catch (error) {
    logger.error("Failed to process state transition", {
      nftMintId,
      paymentTransactionUid,
      state,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default router;
