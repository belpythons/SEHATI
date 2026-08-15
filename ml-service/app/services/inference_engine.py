from typing import Dict, List, Tuple
import math
from app.schemas.screening_payload import ScreeningPayload


# Naive Bayes risk classifier for stunting vulnerability
# Based on WHO UNICEF data determinants

# Prior probabilities for each risk tier (based on demographic distributions)
PRIORS = {
    "LOW": 0.50,
    "MODERATE": 0.35,
    "HIGH": 0.15,
}

# Conditional likelihoods: P(feature=1 | risk_tier)
# Features in order: exclusiveAsi, cleanWaterAccess, sanitationAccess, smokeExposure,
# economicQuintile (discretized), motherEducation (discretized), diarrheaHistory, bblrHistory
# Values are probabilities of feature being TRUE given the risk tier

LIKELIHOODS = {
    "LOW": {
        "exclusiveAsi": 0.10,
        "cleanWaterAccess": 0.85,
        "sanitationAccess": 0.80,
        "smokeExposure": 0.10,
        "economicQuintile": 0.30,
        "motherEducation": 0.35,
        "diarrheaHistory": 0.10,
        "bblrHistory": 0.10,
    },
    "MODERATE": {
        "exclusiveAsi": 0.30,
        "cleanWaterAccess": 0.65,
        "sanitationAccess": 0.55,
        "smokeExposure": 0.35,
        "economicQuintile": 0.50,
        "motherEducation": 0.50,
        "diarrheaHistory": 0.30,
        "bblrHistory": 0.30,
    },
    "HIGH": {
        "exclusiveAsi": 0.60,
        "cleanWaterAccess": 0.35,
        "sanitationAccess": 0.30,
        "smokeExposure": 0.70,
        "economicQuintile": 0.70,
        "motherEducation": 0.70,
        "diarrheaHistory": 0.60,
        "bblrHistory": 0.60,
    },
}


def _discretize_quintile(quintile: int) -> int:
    """Economic quintile: 1 = poorest, 5 = richest."""
    return quintile


def calculate_risk(
    payload: ScreeningPayload,
) -> Tuple[str, float, List[str]]:
    """Calculate Naive Bayes risk tier, score, and dominant factors.
    
    Returns:
        riskTier: "LOW" | "MODERATE" | "HIGH"
        riskScore: float in [0, 1] representing posterior probability of HIGH risk
        dominantFactors: list of dominant factor name strings
    """
    # Discretize features
    q = _discretize_quintile(payload.economicQuintile)

    # Extract boolean/features
    features = {
        "exclusiveAsi": payload.exclusiveAsi,
        "cleanWaterAccess": payload.cleanWaterAccess,
        "sanitationAccess": payload.sanitationAccess,
        "smokeExposure": payload.smokeExposure,
        "economicQuintile": q,
        "motherEducation": 1 if payload.motherEducation else 0,
        "diarrheaHistory": payload.diarrheaHistory,
        "bblrHistory": payload.bblrHistory,
    }

    # Calculate log-posterior for each tier using Naive Bayes
    # P(tier | features) ∝ P(tier) * Π P(feature | tier)
    log_posteriors = {}
    for tier in ["LOW", "MODERATE", "HIGH"]:
        log_post = math.log(PRIORS[tier])
        for feat_name, feat_val in features.items():
            p_given_tier = LIKELIHOODS[tier][feat_name]
            if feat_val:
                log_post += math.log(p_given_tier + 1e-10)
            else:
                log_post += math.log(1.0 - p_given_tier + 1e-10)
        log_posteriors[tier] = log_post

    # Normalize to get proper probabilities via softmax
    max_log = max(log_posteriors.values())
    exp_vals = {t: log_p - max_log for t, log_p in log_posteriors.items()}
    sum_exp = sum(math.exp(v) for v in exp_vals.values())
    probabilities = {t: math.exp(v) / sum_exp for t, v in exp_vals.items()}

    # Risk score = probability of HIGH risk
    risk_score = probabilities["HIGH"]

    # Determine risk tier (highest posterior probability)
    risk_tier = max(probabilities, key=probabilities.get)

    # Dominant factor extraction
    # For each feature, compute likelihood ratio (p_true / (1 - p_true)) as contribution score
    factor_contributions = {}
    for feat_name in features:
        p_true = LIKELIHOODS[risk_tier][feat_name]
        p_false = 1.0 - p_true
        ratio = p_true / p_false if p_false > 0 else float("inf")
        factor_contributions[feat_name] = ratio

    # Sort features by contribution ratio (descending) and select top 2
    factor_label_map = {
        "exclusiveAsi": "ASI_EXCLUSIF_BURUK",
        "cleanWaterAccess": "AKSES_AIR_BERSIH",
        "sanitationAccess": "AKSES_SANITASI_BURUK",
        "smokeExposure": "PAPARAN_ASAP_ROKOK",
        "economicQuintile": "EKONOMI_RENDAH",
        "motherEducation": "PENDIDIKAN_IBU_RINGAN",
        "diarrheaHistory": "SEJARAH_DIARE",
        "bblrHistory": "SEJARAH_BBLR",
    }

    sorted_factors = sorted(
        factor_contributions.items(), key=lambda x: x[1], reverse=True
    )

    # Select top 2 dominant factors
    dominant_factors = [
        factor_label_map.get(fname, fname.upper())
        for fname, _ in sorted_factors[:2]
    ]

    return risk_tier, risk_score, dominant_factors