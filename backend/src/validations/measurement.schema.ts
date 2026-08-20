import { z } from 'zod';
import { screeningMessages } from '../constants/messages';

export const childMeasurementSchema = z.object({
    ageMonths: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.ageMonthsRequired;
            } else {
                return screeningMessages.ageMonthsInteger;
            }
        },
    }).int({
        error: screeningMessages.ageMonthsInteger,
    }).min(0, {
        error: screeningMessages.ageMonthsRange,
    }).max(239, {
        error: screeningMessages.ageMonthsRange,
    }),

    gender: z.enum(['Laki-Laki', 'Perempuan'], {
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.genderRequired;
            } else {
                return screeningMessages.genderInvalid;
            }
        },
    }),

    weightKg: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.weightKgRequired;
            } else {
                return screeningMessages.weightKgPositive;
            }
        },
    }).positive({
        error: screeningMessages.weightKgPositive,
    }).min(0.1, {
        error: screeningMessages.weightKgPositive,
    }).max(30.0, {
        error: screeningMessages.weightKgPositive,
    }),

    heightCm: z.number({
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.heightCmRequired;
            } else {
                return screeningMessages.heightCmPositive;
            }
        },
    }).positive({
        error: screeningMessages.heightCmPositive,
    }).min(30.0, {
        error: screeningMessages.heightCmPositive,
    }).max(130.0, {
        error: screeningMessages.heightCmPositive,
    }),
});

export type ChildMeasurementType = z.infer<typeof childMeasurementSchema>;
