-- AlterTable
ALTER TABLE "t_tickets"
    ADD COLUMN "claim_link_id" TEXT,
ALTER
COLUMN "reason" SET DEFAULT 'GIFTED';

-- CreateTable
CREATE TABLE "t_ticket_issuers"
(
    "id"               TEXT         NOT NULL,
    "qty_to_be_issued" INTEGER      NOT NULL DEFAULT 1,
    "utility_id"       TEXT         NOT NULL,
    "owner_id"         TEXT         NOT NULL,
    "claim_link_id"    TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3),

    CONSTRAINT "t_ticket_issuers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_ticket_claim_links"
(
    "id"         TEXT              NOT NULL,
    "status"     "ClaimLinkStatus" NOT NULL DEFAULT 'ISSUED',
    "qty"        INTEGER           NOT NULL DEFAULT 1,
    "issuer_id"  TEXT              NOT NULL,
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_ticket_claim_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_ticket_issuers_claim_link_id_key" ON "t_ticket_issuers" ("claim_link_id");

-- CreateIndex
CREATE UNIQUE INDEX "t_ticket_claim_links_issuer_id_key" ON "t_ticket_claim_links" ("issuer_id");

-- AddForeignKey
ALTER TABLE "t_ticket_issuers"
    ADD CONSTRAINT "t_ticket_issuers_utility_id_fkey" FOREIGN KEY ("utility_id") REFERENCES "t_utilities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_ticket_issuers"
    ADD CONSTRAINT "t_ticket_issuers_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "t_users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_ticket_claim_links"
    ADD CONSTRAINT "t_ticket_claim_links_issuer_id_fkey" FOREIGN KEY ("issuer_id") REFERENCES "t_ticket_issuers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_tickets"
    ADD CONSTRAINT "t_tickets_claim_link_id_fkey" FOREIGN KEY ("claim_link_id") REFERENCES "t_ticket_claim_links" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
