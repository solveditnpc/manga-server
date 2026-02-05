-- CreateTable
CREATE TABLE "Likes" (
    "user_id" INTEGER NOT NULL,
    "manga_id" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "server" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "manga_id", "server"),
    CONSTRAINT "Likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
