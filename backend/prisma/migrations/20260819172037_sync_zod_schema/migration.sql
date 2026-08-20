/*
  Warnings:

  - Added the required column `isOutsideBontang` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScreeningRecord" ADD COLUMN     "isOutsideBontang" BOOLEAN NOT NULL;
