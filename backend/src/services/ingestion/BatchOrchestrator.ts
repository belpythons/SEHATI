import { BatchParserService } from "./BatchParserService";
import { BatchValidationService } from "./BatchValidationService";
import { BatchMlService } from "./BatchMLService";
import { BatchPersistenceService } from "./BatchPersistenceService";
import { ingestMessages } from "../../constants/messages";

// Jalankan promise async dengan jumlah konkurensi terbatas
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const worker = async () => {
    while (cursor < items.length) {
      const current = cursor++;
      results[current] = await fn(items[current], current);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker())
  );
  return results;
}

export class BatchOrchestrator {
  static async processBatch(
    sourceType: string,
    fileContent: string,
    sourceName: string,
    deps: {
      saveBatch?: typeof BatchPersistenceService.saveBatch;
      enrichWithML?: typeof BatchMlService.enrichWithML;
    } = {}
  ) {
    const saveBatch = deps.saveBatch ?? BatchPersistenceService.saveBatch;
    const enrichWithML = deps.enrichWithML ?? BatchMlService.enrichWithML;

    // membuat tanda pengenal unik 
    const batchId = `BATCH_${Date.now()}`;

    // Parse & transform melempar error bila kosong)
    const rows = await BatchParserService.parse(sourceType, fileContent);

    // data yang berhasil akan masuk ke processedData
    const processedData: any[] = [];
    const errors: any[] = [];

    const validatedRows = await mapWithConcurrency(rows, 20, async (row, index) => {
      const validation = BatchValidationService.validateRow(row);
      if (!validation.valid) {
        return {
          ok: false as const,
          error: {
            row: index + 1,
            message: ingestMessages.rowValidationError.replace("{row}", String(index + 1)),
            details: validation.errors,
          },
        };
      }
      return { ok: true as const, data: validation.data };
    });

    for (const item of validatedRows) {
      if (!item.ok) {
        errors.push(item.error);
        continue;
      }
      processedData.push(item.data);
    }

    // Enrich dengan ML (konkurensi terbatas)
    const enrichedErrors: any[] = [];
    const enriched = await mapWithConcurrency(processedData, 10, async (row) => {
      try {
        return { ok: true as const, data: await enrichWithML(row) };
      } catch (mlError) {
        return { ok: false as const, error: (mlError as Error)?.message ?? "ML error" };
      }
    });

    const mlReadyData: any[] = [];
    for (const item of enriched) {
      if (item.ok) {
        mlReadyData.push(item.data);
      } else {
        enrichedErrors.push(item.error);
      }
    }

    try {
      // menyimpan ke database 
      const result = await saveBatch(
        mlReadyData,
        sourceType,
        sourceName,
        batchId,
        rows.length
      );

      return {
        batchId,
        ...result,
        errors: [...errors, ...enrichedErrors].slice(0, 100),
      };
    } catch (dbError) {
      console.error("DETAIL ERROR PRISMA/ML:", dbError);
      throw new Error(ingestMessages.persistenceFailed);
    }
  }
}