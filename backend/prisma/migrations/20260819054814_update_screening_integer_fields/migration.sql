/*
  Warnings:

  - You are about to drop the column `cleanWaterAccess` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `diarrheaHistory` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `exclusiveAsi` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `sanitationAccess` on the `ScreeningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `smokeExposure` on the `ScreeningRecord` table. All the data in the column will be lost.
  - Added the required column `asiExclusiveOption` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bblrOption` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diarrheaHistoryOption` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motherEducation` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mpasiAgeOption` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posyanduKiaOption` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sanitationType` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smokeExposureOption` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waterSourceType` to the `ScreeningRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScreeningRecord" DROP COLUMN "cleanWaterAccess",
DROP COLUMN "diarrheaHistory",
DROP COLUMN "exclusiveAsi",
DROP COLUMN "sanitationAccess",
DROP COLUMN "smokeExposure",
ADD COLUMN     "animalProteinTypes" INTEGER[],
ADD COLUMN     "asiExclusiveOption" INTEGER NOT NULL,
ADD COLUMN     "bblrOption" INTEGER NOT NULL,
ADD COLUMN     "diarrheaHistoryOption" INTEGER NOT NULL,
ADD COLUMN     "motherEducation" INTEGER NOT NULL,
ADD COLUMN     "mpasiAgeOption" INTEGER NOT NULL,
ADD COLUMN     "posyanduKiaOption" INTEGER NOT NULL,
ADD COLUMN     "sanitationType" INTEGER NOT NULL,
ADD COLUMN     "smokeExposureOption" INTEGER NOT NULL,
ADD COLUMN     "waterSourceType" INTEGER NOT NULL;
