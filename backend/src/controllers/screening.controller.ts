// import { Request, Response } from "express";
// import { prisma } from "../utils/prisma";
// import fetch from "node-fetch";
// import { logger } from "../utils/logger";

import { Request, Response, NextFunction } from "express";
import { screeningSchema } from "../validations/screening.schema";
import { findOrCreateSession } from "../services/session.service";
import { mlClient } from "../services/mlClient.service";
import { prisma } from "../utils/prisma";
import { ZodError } from "zod";



// export const screeningController = {
//   async submit(req: Request, res: Response) {
//     const payload = req.body;

//     try {
//       const { clientToken, ...screeningData } = payload;

//       let session = await prisma.anonymousSession.findUnique({
//         where: { clientToken },
//       });

//       if (!session) {
//         session = await prisma.anonymousSession.create({
//           data: { clientToken, persona: "ORANG_TUA" },
//         });
//       }

//       // Call ML microservice for Z-Score calculation
//       const mlResponse = await fetch("http://ml-service:8000/api/v1/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(screeningData),
//       });

//       const mlResult: any = await mlResponse.json();

//       const screeningRecord = await prisma.screeningRecord.create({
//         data: {
//           sessionId: session.id,
//           sourceType: screeningData.sourceType || "PWA_DIRECT_USER",
//           persona: screeningData.persona || "ORANG_TUA",
//           kelurahan: screeningData.kelurahan,
//           ageMonths: screeningData.ageMonths,
//           gender: screeningData.gender,
//           weightKg: screeningData.weightKg,
//           heightCm: screeningData.heightCm,
//           zScore: mlResult.zScore,
//           zScoreWAZ: mlResult.zScoreWAZ,
//           zScoreWHZ: mlResult.zScoreWHZ,
//           statusGiziTBU: mlResult.statusGiziTBU,
//           statusGiziBBU: mlResult.statusGiziBBU,
//           statusGiziBBTB: mlResult.statusGiziBBTB,
//           exclusiveAsi: screeningData.exclusiveAsi,
//           sanitationAccess: screeningData.sanitationAccess,
//           cleanWaterAccess: screeningData.cleanWaterAccess,
//           smokeExposure: screeningData.smokeExposure,
//           economicQuintile: screeningData.economicQuintile,
//           diarrheaHistory: screeningData.diarrheaHistory,
//           riskTier: mlResult.riskTier,
//           riskScore: mlResult.riskScore,
//           dominantFactors: mlResult.dominantFactors,
//           rawMetadata: mlResult.rawMetadata,
//         },
//       });

//       res.status(201).json({
//         data: screeningRecord,
//         shareHash: screeningRecord.shareHash,
//       });
//     } catch (error) {
//       logger.error("Screening error:", error);
//       res.status(500).json({ error: "Failed to process screening" });
//     }
//   },
// };


export const submitScreening = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log("Request masuk ke /screening/submitt");
  // console.log("Raw Body: JSON.stringfy(req.body, null,2")

  try {
    // Validasi data 
    // console.log("Memvalidasi data dengan zood")
    const validateData = screeningSchema.parse(req.body);
    // console.log("Validasi Berhasil! Data tervalidasi:", JSON.stringify(validateData, null, 2));

    // Mendapatkan session,
    // console.log("Memproses sesi")
    const session = await findOrCreateSession(
      validateData.clientToken,
      validateData.persona
    );
    // console.log("Sesi siap digunakan:", session.id);

    // Memanggil Ml Service
    // console.log("Memanggil ML Service")
    const prediction = await mlClient.predict({
      ageMonths: validateData.ageMonths,
      gender: validateData.gender,
      weightKg: validateData.weightKg,
      heightCm: validateData.heightCm
    }) 
    // console.log("Ml service selesai dipanggil")

    // Simpan ke database
    // console.log("Menyimpan ke database")

    const { clientToken, ...screeningData} = validateData;

    const screeningRecord = await prisma.screeningRecord.create({
      data: {
        sessionId: session.id,
        sourceType: "PWA_DIRECT_USER",
        // ...validateData,
        ...screeningData,
        zScore: prediction.zScore,
        zScoreWAZ: prediction.zScoreWAZ,
        zScoreWHZ: prediction.zScoreWHZ,
        statusGiziTBU: prediction.statusGiziTBU,
        statusGiziBBU: prediction.statusGiziBBU,
        statusGiziBBTB: prediction.statusGiziBBTB,
        riskTier: prediction.riskTier,
        riskScore: prediction.riskScore,
        dominantFactors: prediction.dominantFactors,
        rawMetadata: prediction.rawMetadata || null,
      },
    });
    // console.log("Data berhasil disimpan, ID", screeningRecord.id);

    // Response
    res.status(201).json({
      success: true,
      data: {
        screeningId: screeningRecord.id,
        shareHash: screeningRecord.shareHash,
        riskScore: screeningRecord.riskScore,
        dominantFactors: screeningRecord.dominantFactors,
        zScores: {
          tbu: screeningRecord.zScore,
          bbu: screeningRecord.zScoreWAZ,
          bbtb: screeningRecord.zScoreWHZ,
        },
      },
    });
    // console.log("Response berhasil dikirim ke client")
  } catch (error) {
    console.error("Terjadi error di controller")
    if (error instanceof ZodError){
      console.log("Error validasi Zod: error.issues");
      res.status(400).json({
        success: false,
        errors: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    
    // console.error("Error internal server", error);
    next(error);
  }
}