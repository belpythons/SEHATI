import { IDataTransformer } from "./interfaces/IDataTransformer";
import { CsvSurveyAdapter } from "./csvSurveyAdapter";
import { RiskesdasAdapter } from "./riskesdasAdapter";

//instansiasi adapter
export class transformerFactory {
    static getAdapter(sourceType: string): IDataTransformer {
        switch(sourceType) {
            // DataSourceType.RISKESDAS_KEMENKES
            case 'riskesdas':
                return new RiskesdasAdapter();
            // DataSourceType.SURVER_CSV_UPLOAD
            case 'csv-survey':
                return new CsvSurveyAdapter();
            // default jika tidak cocok dengan salah satu tipe tersebut
            default:
                throw new Error(`Unsupported source type: ${sourceType}`);
        }
    }
}