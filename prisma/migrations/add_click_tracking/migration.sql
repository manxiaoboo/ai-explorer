-- CreateTable
CREATE TABLE "ToolClick" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolSave" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolSave_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ToolClick_toolId_createdAt_idx" ON "ToolClick"("toolId", "createdAt");
CREATE INDEX "ToolClick_createdAt_idx" ON "ToolClick"("createdAt");
CREATE INDEX "ToolSave_toolId_idx" ON "ToolSave"("toolId");
CREATE UNIQUE INDEX "ToolSave_toolId_ipHash_key" ON "ToolSave"("toolId", "ipHash");
