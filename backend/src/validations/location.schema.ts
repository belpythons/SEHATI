import { z } from 'zod';
import { screeningMessages } from '../constants/messages';
import { kelurahanBontang } from '../constants/bontang';

// Schema untuk lokasi di Bontang
export const bontangLocationSchema = z.object({
    isOutsideBontang: z.literal(false),
    kelurahan: z.enum(kelurahanBontang, {
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.kelurahanRequired;
            } else {
                return screeningMessages.kelurahanInvalid;
            }
        },
    }),
});

// Schema untuk lokasi di luar Bontang
export const outsideBontangLocationSchema = z.object({
    isOutsideBontang: z.literal(true),
    kelurahan: z.string({
        error: screeningMessages.kelurahanRequired,
    }).min(2, {
        error: screeningMessages.kelurahanMin,
    }),
});

export const locationSchema = z.discriminatedUnion('isOutsideBontang', [
    bontangLocationSchema,
    outsideBontangLocationSchema,
]);
