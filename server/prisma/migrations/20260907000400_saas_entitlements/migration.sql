ALTER TABLE "User"
ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'FREE',
ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
ADD COLUMN "billingCustomerId" TEXT,
ADD COLUMN "billingPeriodEnd" TIMESTAMP(3);

CREATE INDEX "User_plan_subscriptionStatus_idx" ON "User"("plan", "subscriptionStatus");
