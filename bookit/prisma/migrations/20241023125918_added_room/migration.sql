-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Room_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
