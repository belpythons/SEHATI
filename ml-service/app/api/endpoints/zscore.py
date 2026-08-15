from app.services.zscore_engine import calculate_z_scores

def predict_zscore(payload):
    '''Predict Z-scores from screening payload.''' z_scores = calculate_z_scores(
        age_months=payload.ageMonths,
        gender=payload.gender,
        weight_kg=payload.weightKg,
        height_cm=payload.heightCm,
    )
    return z_scores
