from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .services.zscore_engine import calculate_z_scores
from .services.inference_engine import calculate_risk
from .schemas.screening_payload import ScreeningPayload

app = FastAPI(
    title="SEHATI ML Service",
    version="1.0.0",
    description="ML & WHO Compute Microservice for Stunting Detection",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/predict")
def predict(payload: ScreeningPayload):
    z_scores = calculate_z_scores(
        age_months=payload.ageMonths,
        gender=payload.gender,
        weight_kg=payload.weightKg,
        height_cm=payload.heightCm,
    )

    risk_tier, risk_score, dominant_factors = calculate_risk(payload)

    response = {
        "zScoreTBU": z_scores["zScoreTBU"],
        "statusGiziTBU": z_scores["statusGiziTBU"],
        "zScoreBBU": z_scores["zScoreBBU"],
        "statusGiziBBU": z_scores["statusGiziBBU"],
        "zScoreBBTB": z_scores["zScoreBBTB"],
        "statusGiziBBTB": z_scores["statusGiziBBTB"],
        "riskScore": risk_score,
        "riskTier": risk_tier,
        "dominantFactors": dominant_factors,
    }

    return response


@app.get("/health")
def health():
    return {"status": "healthy", "service": "ml-service"}