/*
  Warnings:

  - You are about to drop the column `animalProteinTypes` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `asiExclusiveOption` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `diarrheaHistoryOption` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `mpasiAgeOption` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `posyanduKiaOption` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `sanitationType` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `smokeExposureOption` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `waterSourceType` on the `ScreeningRecord` table. All the data in the column will be lost.
  - Added the required column `cleanWaterAccess` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diarrheaHistory` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exclusiveAsi` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mpasiAge` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posyanduKia` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sanitationAccess` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smokeExposure` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScreeningRecord" DROP COLUMN "animalProteinTypes",
DROP COLUMN "asiExclusiveOption",
DROP COLUMN "diarrheaHistoryOption",
DROP COLUMN "mpasiAgeOption",
DROP COLUMN "posyanduKiaOption",
DROP COLUMN "sanitationType",
DROP COLUMN "smokeExposureOption",
DROP COLUMN "waterSourceType",
ADD COLUMN     "animalProtein" INTEGER[],
ADD COLUMN     "cleanWaterAccess" INTEGER NOT NULL,
ADD COLUMN     "diarrheaHistory" INTEGER NOT NULL,
ADD COLUMN     "exclusiveAsi" INTEGER NOT NULL,
ADD COLUMN     "mpasiAge" INTEGER NOT NULL,
ADD COLUMN     "posyanduKia" INTEGER NOT NULL,
ADD COLUMN     "sanitationAccess" INTEGER NOT NULL,
ADD COLUMN     "smokeExposure" INTEGER NOT NULL;
