import fetch from "node-fetch";

export const mlClient = {
  async predict(screeningData: any) {
    const response = await fetch("http://ml-service:8000/api/v1/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(screeningData),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`ML service error: ${response.status} - ${errorBody}`);
    }

    return response.json();
  },
};