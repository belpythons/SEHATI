from app.schemas.screening_payload import ScreeningPayload
from app.services.zscore_engine import calculate_z_scores
from app.services.inference_engine import calculate_risk

def predict(payload: ScreeningPayload):
    z_scores = calculate_z_scores(
        age_months=payload.ageMonths,
        gender=payload.gender,
        weight_kg=payload.weightKg,
        height_cm=payload.heightCm,
    )

    risk_tier, risk_score, dominant_factors = calculate_risk(payload)

    return {
        'zScoreTBU': z_scores['zScoreTBU'],
        'statusGiziTBU': z_scores['statusGiziTBU'],
        'zScoreBBU': z_scores['zScoreBBU'],
        'statusGiziBBU': z_scores['statusGiziBBU'],
        'zScoreBBTB': z_scores['zScoreBBTB'],
        'statusGiziBBTB': z_scores['statusGiziBBTB'],
        'riskScore': risk_score,
        'riskTier': risk_tier,
        'dominantFactors': dominant_factors,
    }
