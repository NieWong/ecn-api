ALTER TABLE "User"
ADD COLUMN "isAccountant" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_isAccountant_idx" ON "User"("isAccountant");
