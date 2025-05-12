-- CreateTable
CREATE TABLE "_CommunityToPlace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityToPlace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CommunityToPlace_B_index" ON "_CommunityToPlace"("B");

-- AddForeignKey
ALTER TABLE "_CommunityToPlace" ADD CONSTRAINT "_CommunityToPlace_A_fkey" FOREIGN KEY ("A") REFERENCES "t_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityToPlace" ADD CONSTRAINT "_CommunityToPlace_B_fkey" FOREIGN KEY ("B") REFERENCES "t_places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
