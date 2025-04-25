-- CreateEnum
CREATE TYPE "ClaimLinkStatus" AS ENUM ('ISSUED', 'CLAIMED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "TicketStatusReason" ADD VALUE 'GIFTED';

-- AlterTable
ALTER TABLE "t_tickets"
    ALTER COLUMN "reason" DROP DEFAULT;
