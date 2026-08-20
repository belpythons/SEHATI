import { z } from 'zod';
import { screeningMessages } from '../constants/messages';
import { locationSchema } from './location.schema';
import { childMeasurementSchema } from './measurement.schema';
import { riskDeterminantsSchema } from './determinants.schema';

const tokenSchema = z.object({
    clientToken: z.uuid({
        message: screeningMessages.clientTokenUuid,
    }),
});

const personaSchema = z.object({
    persona: z.enum([
        'Orang Tua / Anggota Keluarga Balita',
        'Kader Posyandu',
        'Tenaga Kesehatan / Bidan',
        'Surveyor / Peneliti Lapangan',
    ], {
        error: (issue) => {
            if (issue.input === undefined) {
                return screeningMessages.personaRequired;
            } else {
                return screeningMessages.personaInvalid;
            }
        },
    }).default('Orang Tua / Anggota Keluarga Balita'),
});

// export const screeningSchema = tokenSchema
//     .merge(personaSchema)
//     .merge(childMeasurementSchema)
//     .merge(riskDeterminantsSchema)
//     .and(locationSchema);

export const screeningSchema = z
  .object({
    ...tokenSchema.shape,
    ...personaSchema.shape,
    ...childMeasurementSchema.shape,
    ...riskDeterminantsSchema.shape,
  })
  .and(locationSchema);

  
export type ScreeningSchemaType = z.infer<typeof screeningSchema>;
