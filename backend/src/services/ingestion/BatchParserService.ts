import { transformerFactory } from "../../adapters/transformerFactory";
import { parseCsv } from "../../utils/csvParser";
import { ingestMessages } from "../../constants/messages";

function looksLikeCsv(content: string): boolean {
  const trimmed = content.trimStart();
  // JSON array dimulai dengan '[', objek dengan '{'
  return !trimmed.startsWith("[") && !trimmed.startsWith("{");
}

//parsing file via adapter
export class BatchParserService {
  static async parse(sourceType: string, fileContent: string): Promise<any[]> {
    let records: any[];

    const trimmed = typeof fileContent === "string" ? fileContent.trim() : "";
    if (!trimmed) {
      throw new Error(ingestMessages.emptyRecords);
    }

    if (looksLikeCsv(trimmed)) {
      const { rows } = parseCsv(trimmed);
      records = rows;
    } else {
      try {
        const parsed = JSON.parse(trimmed);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        throw new Error(ingestMessages.invalidJsonContent);
      }
    }

    if (records.length === 0) {
      throw new Error(ingestMessages.emptyRecords);
    }

    //mendapatkan adapter yang sesuai via Factory
    const adapter = transformerFactory.getAdapter(sourceType);
    return adapter.transform(records);
  }
}