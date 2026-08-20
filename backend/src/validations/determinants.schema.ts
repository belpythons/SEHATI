import { z } from 'zod';
import { screeningMessages } from '../constants/messages';

export const riskDeterminantsSchema = z.object({
    //Berat Badan
    bblrOption: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.bblrOptionRequired;
            } else {
                return screeningMessages.bblrOptionInvalid;
            }
        },
    }).int({
        error: screeningMessages.bblrOptionInvalid,
    }).min(1, {
        error: screeningMessages.bblrOptionInvalid,
    }).max(3, {
        error: screeningMessages.bblrOptionInvalid,
    }),

    // Pemberian ASI
    exclusiveAsi: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.exclusiveAsiRequired;
            } else {
                return screeningMessages.exclusiveAsiInvalid;
            }
        },
    }).int({
        error: screeningMessages.exclusiveAsiInvalid,
    }).min(1, {
        error: screeningMessages.exclusiveAsiInvalid,
    }).max(3, {
        error: screeningMessages.exclusiveAsiInvalid,
    }),

    // Pemberian Makanan Padat untuk pertamakali
    mpasiAge: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.mpasiAgeRequired;
            } else {
                return screeningMessages.mpasiAgeInvalid;
            }
        },
    }).int({
        error: screeningMessages.mpasiAgeInvalid,
    }).min(1, {
        error: screeningMessages.mpasiAgeInvalid,
    }).max(4, {
        error: screeningMessages.mpasiAgeInvalid,
    }),

    //Keragaman Asupan
    animalProtein: z.array(z.number().min(1).max(5), {
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.animalProteinRequired;
            } else {
                return screeningMessages.animalProteinInvalid;
            }
        },
    }).min(1, {
        error: screeningMessages.animalProteinInvalid,
    }),

    //Sumber air minum
    cleanWaterAccess: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.cleanWaterAccessRequired;
            } else {
                return screeningMessages.cleanWaterAccessRange;
            }
        },
    }).int({
        error: screeningMessages.cleanWaterAccessRange,
    }).min(1, {
        error: screeningMessages.cleanWaterAccessRange,
    }).max(4, {
        error: screeningMessages.cleanWaterAccessRange,
    }),

    // WC
    sanitationAccess: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.sanitationAccessRequired;
            } else {
                return screeningMessages.sanitationAccessRange;
            }
        },
    }).int({
        error: screeningMessages.sanitationAccessRange,
    }).min(1, {
        error: screeningMessages.sanitationAccessRange,
    }).max(4, {
        error: screeningMessages.sanitationAccessRange,
    }),

    //Rokok
    smokeExposure: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.smokeExposureRequired;
            } else {
                return screeningMessages.smokeExposureRange;
            }
        },
    }).int({
        error: screeningMessages.smokeExposureRange,
    }).min(1, {
        error: screeningMessages.smokeExposureRange,
    }).max(2, {
        error: screeningMessages.smokeExposureRange,
    }),

    //Pendidikan IBU
    motherEducation: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.motherEducationRequired;
            } else {
                return screeningMessages.motherEducationInvalid;
            }
        },
    }).int({
        error: screeningMessages.motherEducationInvalid,
    }).min(1, {
        error: screeningMessages.motherEducationInvalid,
    }).max(4, {
        error: screeningMessages.motherEducationInvalid,
    }),

    //Tingkat Kesejahteraan
    economicQuintile: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.economicQuintileRequired;
            } else {
                return screeningMessages.economicQuintileRange;
            }
        },
    }).int({
        error: screeningMessages.economicQuintileRange,
    }).min(1, {
        error: screeningMessages.economicQuintileRange,
    }).max(5, {
        error: screeningMessages.economicQuintileRange,
    }),

    //Riwayat diare Balita dalam 3 Bulan Terakhir
    diarrheaHistory: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.diarrheaHistoryRequired;
            } else {
                return screeningMessages.diarrheaHistoryRange;
            }
        },
    }).int({
        error: screeningMessages.diarrheaHistoryRange,
    }).min(1, {
        error: screeningMessages.diarrheaHistoryRange,
    }).max(2, {
        error: screeningMessages.diarrheaHistoryRange,
    }),

    //Kempemilikan Buku KIA dan Keaktifan Posyandu
    posyanduKia: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.posyanduKiaRequired;
            } else {
                return screeningMessages.posyanduKiaInvalid;
            }
        },
    }).int({
        error: screeningMessages.posyanduKiaInvalid,
    }).min(1, {
        error: screeningMessages.posyanduKiaInvalid,
    }).max(3, {
        error: screeningMessages.posyanduKiaInvalid,
    }),
});

export type RiskDeterminantsType = z.infer<typeof riskDeterminantsSchema>;
