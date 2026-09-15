-- AlterTable
ALTER TABLE "users"
ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailVerificationToken" TEXT,
ADD COLUMN "emailVerificationExpires" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invites" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "workspace_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_emailVerificationToken_key"
ON "users"("emailVerificationToken");

CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key"
ON "workspace_members"("workspaceId", "userId");

CREATE INDEX "workspace_members_workspaceId_idx"
ON "workspace_members"("workspaceId");

CREATE INDEX "workspace_members_userId_idx"
ON "workspace_members"("userId");

CREATE UNIQUE INDEX "workspace_invites_token_key"
ON "workspace_invites"("token");

CREATE INDEX "workspace_invites_workspaceId_idx"
ON "workspace_invites"("workspaceId");

CREATE INDEX "workspace_invites_inviterId_idx"
ON "workspace_invites"("inviterId");

CREATE INDEX "workspace_invites_email_idx"
ON "workspace_invites"("email");

CREATE INDEX "workspace_invites_expiresAt_idx"
ON "workspace_invites"("expiresAt");

-- AddForeignKey
ALTER TABLE "workspace_members"
ADD CONSTRAINT "workspace_members_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_members"
ADD CONSTRAINT "workspace_members_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_invites"
ADD CONSTRAINT "workspace_invites_workspaceId_fkey"
FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workspace_invites"
ADD CONSTRAINT "workspace_invites_inviterId_fkey"
FOREIGN KEY ("inviterId") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
