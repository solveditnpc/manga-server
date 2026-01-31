-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "manga_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parent_id" INTEGER,
    "replies_count" INTEGER DEFAULT 0,
    CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Comment_manga_id_idx" ON "Comment"("manga_id");

-- CreateIndex
CREATE INDEX "Comment_user_id_idx" ON "Comment"("user_id");

-- CreateIndex
CREATE INDEX "Comment_parent_id_idx" ON "Comment"("parent_id");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
