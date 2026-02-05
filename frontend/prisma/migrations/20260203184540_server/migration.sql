/*
  Warnings:

  - Added the required column `server` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "manga_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parent_id" INTEGER,
    "replies_count" INTEGER DEFAULT 0,
    "server" TEXT NOT NULL,
    CONSTRAINT "Comment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("content", "created_at", "id", "manga_id", "parent_id", "replies_count", "user_id") SELECT "content", "created_at", "id", "manga_id", "parent_id", "replies_count", "user_id" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_manga_id_idx" ON "Comment"("manga_id");
CREATE INDEX "Comment_user_id_idx" ON "Comment"("user_id");
CREATE INDEX "Comment_parent_id_idx" ON "Comment"("parent_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
