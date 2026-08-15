# Application Configuration
# FastAPI ML Service Configuration Settings

APP_TITLE = 'SEHATI ML Service'
APP_VERSION = '1.0.0'
APP_DESCRIPTION = 'ML & WHO Compute Microservice for Stunting Detection'

# API Endpoints
API_V1_PREFIX = '/api/v1'

# Z-Score Calculation Thresholds (WHO 2006)
Z_SCORE_THRESHOLDS_TBU = {
    'severe_stunted': -3.0,
    'stunted': -2.0,
    'normal_upper': 0.0,
}

Z_SCORE_THRESHOLDS_BEU = {
    'severe_underweight': -3.0,
    'underweight': -2.0,
    'normal_upper': 0.0,
}

Z_SCORE_THRESHOLDS_BBTB = {
    'severely_wasted': -3.0,
    'wasted': -2.0,
    'normal_upper': 0.0,
}

# Risk Classification Thresholds
RISK_TIER_THRESHOLDS = {
    'LOW': 0.33,
    'MODERATE': 0.66,
    'HIGH': 1.0,
}

# Default Payload Values
DEFAULT_PAYLOAD = {
    'ageMonths': 18,
    'gender': 'L',
    'weightKg': 8.5,
    'heightCm': 74.5,
    'exclusiveAsi': True,
    'sanitationAccess': False,
    'cleanWaterAccess': True,
    'smokeExposure': True,
    'economicQuintile': 2,
    'motherEducation': True,
    'diarrheaHistory': False,
    'bblrHistory': False,
}
