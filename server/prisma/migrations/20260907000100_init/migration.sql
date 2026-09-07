CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Address" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "normalizedKey" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "type" TEXT NOT NULL DEFAULT 'Casa',
  "hours" TEXT,
  "access" TEXT,
  "parking" TEXT,
  "notes" TEXT,
  "importCount" INTEGER NOT NULL DEFAULT 1,
  "lastImportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Route" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sourceFilename" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "plannedKm" DOUBLE PRECISION,
  "plannedMinutes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Delivery" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clientId" TEXT,
  "routeId" TEXT,
  "addressId" TEXT,
  "packageNo" TEXT,
  "size" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "deliveredAt" TIMESTAMP(3),
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "accuracy" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Address_userId_normalizedKey_key" ON "Address"("userId", "normalizedKey");
CREATE INDEX "Address_userId_updatedAt_idx" ON "Address"("userId", "updatedAt");
CREATE INDEX "Route_userId_createdAt_idx" ON "Route"("userId", "createdAt");
CREATE UNIQUE INDEX "Delivery_userId_clientId_key" ON "Delivery"("userId", "clientId");
CREATE INDEX "Delivery_userId_deliveredAt_idx" ON "Delivery"("userId", "deliveredAt");
CREATE INDEX "Delivery_routeId_status_idx" ON "Delivery"("routeId", "status");
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Route" ADD CONSTRAINT "Route_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
