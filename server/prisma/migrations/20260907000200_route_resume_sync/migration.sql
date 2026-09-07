ALTER TABLE "Route"
ADD COLUMN "clientId" TEXT,
ADD COLUMN "stops" INTEGER,
ADD COLUMN "deliveriesCount" INTEGER,
ADD COLUMN "completedStops" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "operational" JSONB;

CREATE UNIQUE INDEX "Route_userId_clientId_key" ON "Route"("userId", "clientId");
