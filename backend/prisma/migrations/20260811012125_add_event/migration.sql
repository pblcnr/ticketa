-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "dateBegining" TIMESTAMP(3) NOT NULL,
    "dateEnding" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "ticketmasterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizerId" UUID NOT NULL,
    "gateProfileId" UUID,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_ticketmasterId_key" ON "events"("ticketmasterId");

-- CreateIndex
CREATE UNIQUE INDEX "events_gateProfileId_key" ON "events"("gateProfileId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_gateProfileId_fkey" FOREIGN KEY ("gateProfileId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
