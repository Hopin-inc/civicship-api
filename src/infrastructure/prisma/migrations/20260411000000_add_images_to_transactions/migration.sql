-- CreateTable
CREATE TABLE "_t_images_on_transactions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_t_images_on_transactions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_t_images_on_transactions_B_index" ON "_t_images_on_transactions"("B");

-- AddForeignKey
ALTER TABLE "_t_images_on_transactions" ADD CONSTRAINT "_t_images_on_transactions_A_fkey" FOREIGN KEY ("A") REFERENCES "t_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_t_images_on_transactions" ADD CONSTRAINT "_t_images_on_transactions_B_fkey" FOREIGN KEY ("B") REFERENCES "t_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
