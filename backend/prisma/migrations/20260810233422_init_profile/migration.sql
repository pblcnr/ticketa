-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ORGANIZADOR', 'CLIENTE', 'PORTARIA');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);
