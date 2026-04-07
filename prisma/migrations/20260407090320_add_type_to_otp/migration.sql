/*
  Warnings:

  - Added the required column `type` to the `Otps` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OTPType" AS ENUM ('verify', 'reset');

-- AlterTable
ALTER TABLE "Otps" ADD COLUMN     "type" "OTPType" NOT NULL;
