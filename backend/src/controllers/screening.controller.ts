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
// import { createScreeningSchema } from "../validators/screening.validator";
// import { commonMessages, screeningMessages } from "../constants/messages";
// import { ScreeningService } from "../services/screening.service";
import z from "zod";



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
    const prediction = await mlClient.predict(
      // ageMonths: validateData.ageMonths,
      // gender: validateData.gender,
      // weightKg: validateData.weightKg,
      // heightCm: validateData.heightCm,
      // bblrOption: validateData.bblrOption
      validateData
    ) 
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
        zScore: prediction.zScoreTBU,
        zScoreWAZ: prediction.zScoreBBU,
        zScoreWHZ: prediction.zScoreBBTB,
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


/*
export class screeningController {
  static async submit (
    req: Request,
    res: Response,
  )
  : Promise<void>{
    console.log("incoming payload:", JSON.stringify(req.body, null, 2));

    try {
      // memeriksa body request
      const parseResult = createScreeningSchema.safeParse(req.body);

      // jika tidak valid
      if (!parseResult.success){
        res.status(400).json({
          success: false,
          message: commonMessages.validationFailed,
          error: z.treeifyError(parseResult.error)
        });
        return;
      }
      
      console.log("Processing Screening service")

      //data akan di olah oleh ml dan disimpan ke database
      const record = await ScreeningService.submitScreening(parseResult.data);

      console.log(`Record ID: ${record.id} | ShareHash: ${record.shareHash}`)

      res.status(201).json({
        success: true,
        message: screeningMessages.screeningSuccess,
        data: record,
      })
    } catch (error){

      console.error("controller Error:", error);

      const message = error instanceof Error ? error.message : commonMessages.internalServerError;
      res.status(500).json({ success: false, message });
    }
  }

  //proses get share hash
  static async getByShareHash(
    req: Request,
    res: Response,
  ): Promise<void>{

    console.log("Looking up record")
    
    const { shareHash } = req.params;
    try {

      console.log("Looking up record")

      // pengecekan apakah benar benar string
      if (!shareHash || typeof shareHash !== "string"){
        res.status(400).json({
          success: false,
          message: screeningMessages.shareHashNotFound
        })
        return;
      }

      const record = await ScreeningService.getScreeningByShareHash(shareHash);

      console.log(`Record ID: ${record.id}`)

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error){

      console.error(`[Sharehash Not Found] Hash: ${shareHash}`, error);
      
      const message = error instanceof Error ? error.message : commonMessages.notFound;
      res.status(404).json({ success: false, message });
    }
  }
}
*/
