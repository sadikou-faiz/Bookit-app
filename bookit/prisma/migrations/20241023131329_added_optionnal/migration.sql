-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT,
    "imgUrl" TEXT,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Room_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("capacity", "companyId", "description", "id", "imgUrl", "name") SELECT "capacity", "companyId", "description", "id", "imgUrl", "name" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
