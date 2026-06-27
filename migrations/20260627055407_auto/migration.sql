-- CreateTable
CREATE TABLE "BotBlueprint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "commands" TEXT NOT NULL,
    "integrations" TEXT NOT NULL,
    "knowledgeBase" TEXT NOT NULL,
    "launchPlan" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KnowledgeSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "headline" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "sessionId" TEXT,
    "status" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
