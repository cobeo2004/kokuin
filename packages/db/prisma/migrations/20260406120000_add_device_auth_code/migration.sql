-- CreateTable
CREATE TABLE "device_auth_code" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "userId" TEXT,
    "accessToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_auth_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_auth_code_deviceCode_key" ON "device_auth_code"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "device_auth_code_userCode_key" ON "device_auth_code"("userCode");

-- CreateIndex
CREATE INDEX "device_auth_code_userId_idx" ON "device_auth_code"("userId");

-- CreateIndex
CREATE INDEX "device_auth_code_expiresAt_idx" ON "device_auth_code"("expiresAt");
