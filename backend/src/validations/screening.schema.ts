import { z } from 'zod';
import { screeningMessages } from '../constants/messages';
import { locationSchema } from './location.schema';
import { childMeasurementSchema } from './measurement.schema';
import { riskDeterminantsSchema } from './determinants.schema';

const tokenSchema = z.object({
  clientToken: z.string({
    message: screeningMessages.clientTokenUuid,
  }),
});

const personaSchema = z.object({
  persona: z
    .preprocess(
      // Pembersihan input
      (persona) => (typeof persona === 'string' ? persona.trim().toUpperCase() : persona),
      // Transformasi ke nilai standar
      z.string().transform((persona) => {
        switch (persona) {
          case 'ORANG TUA':
          case 'ANGGOTA KELUARGA BALITA':
          case 'ORANG TUA / ANGGOTA KELUARGA BALITA':
            return 'Orang Tua / Anggota Keluarga Balita';

          case 'KADER POSYANDU':
          case 'KADER':
            return 'Kader Posyandu';

          case 'TENAGA KESEHATAN':
          case 'BIDAN':
            return 'Tenaga Kesehatan / Bidan';

          case 'SURVEYOR':
          case 'PENELITI LAPANGAN':
          case 'SURVEYOR_BATCH':
            return 'Surveyor / Peneliti Lapangan';

          default:
            return persona;
        }
      })
    )
    // Validasi enum dengan penanganan error yang valid di Zod
    .pipe(
      z.enum(
        [
          'Orang Tua / Anggota Keluarga Balita',
          'Kader Posyandu',
          'Tenaga Kesehatan / Bidan',
          'Surveyor / Peneliti Lapangan',
        ],
        {
          error: (issue) => {
            if (issue.input === undefined) {
              return screeningMessages.personaRequired;
            }
            return screeningMessages.personaInvalid;
          },
        }
      )
    )
    .default('Orang Tua / Anggota Keluarga Balita'),
});

export const screeningSchema = z
  .object({
    ...tokenSchema.shape,
    ...personaSchema.shape,
    ...childMeasurementSchema.shape,
    ...riskDeterminantsSchema.shape,
  })
  .and(locationSchema);

export type ScreeningSchemaType = z.infer<typeof screeningSchema>;