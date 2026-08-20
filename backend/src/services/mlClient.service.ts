// ML Prediction Input
export interface MLPredictionResponse {
  zScore: number;
  zScoreWAZ?: number;
  zScoreWHZ?: number;
  statusGiziTBU?: string;
  statusGiziBBU?: string;
  statusGiziBBTB?: string;
  riskTier: string;
  riskScore: number;
  dominantFactors: string[];
  rawMetadata?: any;
}

// ML Prediction Response
export interface MLPredictionInput {
  ageMonths: number;
  gender: string;
  weightKg: number;
  heightCm: number;
}

// Private helper function 
const mapToMLPayload = (data: MLPredictionInput) => {
  // ageMonths: data.ageMonths,
  // gender: data.gender === "Laki-Laki" ? "L" : "P",
  // weightKg: data.weightKg,
  // heightCm: data.heightCm,
  const payload = {
    ageMonths: data.ageMonths,
    gender: data.gender === 'Laki-Laki' ? 'L' : 'P',
    weightKg: data.weightKg,
    heightCm: data.heightCm,
  };

  console.log('Mapping Gender:',{
    inputGender: data.gender,
    outputGender: payload.gender,
  })
  return payload;
};


export const mlClient = {
  async predict(screeningData: MLPredictionInput): Promise<MLPredictionResponse> {
    // console.log("Data masuk ke ML client:", screeningData)
    const mlPayload = mapToMLPayload(screeningData);
    // console.log("payload final yang dikirim ke FastAPI:", mlPayload)

    // const response = await fetch("http://ml-service:8000/api/v1/predict", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(mlPayload),
    // });

    // if (!response.ok) {
    //   const errorBody = await response.text();
    //   throw new Error(`ML service error: ${response.status} - ${errorBody}`);
    // }

    // return response.json();

    // mock data untuk testing
    // return {
    //   zScore: 0.5,
    //   zScoreWAZ: 0.3,
    //   zScoreWHZ: 0.2,
    //   statusGiziTBU: "Normal",
    //   statusGiziBBU: "Normal",
    //   statusGiziBBTB: "Normal",
    //   riskTier: "LOW",
    //   riskScore: 0.2,
    //   dominantFactors: ["Berat badan ideal", "Tinggi badan normal"],
    // };

    try {
      const response = await fetch("http://ml-service:8000/api/v1/predict", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mlPayload)
      });
      
      // console.log("Status HTTP:", response.status);

      if (!response.ok){
        const errorBody = await response.text();
        // console.log("Response Error:", errorBody);
        throw new Error(`Ml service:" ${response.status} - ${errorBody}`);
      } 
      const result = await response.json();
      // console.log("Hasil Prediksi", result);
      return result;
    } catch (error) {
      // console.error("Gagal koneksi ke ML service", error)
      throw error;
    }
  },
};