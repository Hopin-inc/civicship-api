-- CreateEnum
CREATE TYPE "PaymentEventType" AS ENUM ('PAYMENT', 'REFUND');

-- AlterEnum
ALTER TYPE "Provider" ADD VALUE 'SQUARE';

-- AlterTable
ALTER TABLE "t_payment_events" ADD COLUMN     "event_category" "PaymentEventType" NOT NULL DEFAULT 'PAYMENT';
