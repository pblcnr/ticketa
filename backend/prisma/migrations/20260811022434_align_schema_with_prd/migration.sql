/*
  Warnings:

  - You are about to drop the column `dateBegining` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `dateEnding` on the `events` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[qrToken]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPriceInCents` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPriceInCents` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrToken` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('APPROVED', 'DECLINED');

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "events" DROP COLUMN "dateBegining",
DROP COLUMN "dateEnding",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "totalPriceInCents" INTEGER NOT NULL,
ADD COLUMN     "unitPriceInCents" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "qrToken" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservationId" UUID NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_reservationId_key" ON "payments"("reservationId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qrToken_key" ON "tickets"("qrToken");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
