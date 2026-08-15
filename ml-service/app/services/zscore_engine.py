from typing import Literal
import math


StatusTBU = Literal["Sangat Pendek", "Pendek", "Normal", "Tinggi"]
StatusBBU = Literal["Kurus", "Normal", "Risiko BB Lebih"]
StatusBBTB = Literal["Kurus", "Normal", "Berisiko Gizi Lebih", "Overweight/Obesitas"]


def _lms_z_score(x: float, l: float, m: float, s: float) -> float:
    """Calculate Z-score using the LMS method.
    
    X = measurement value
    L = power parameter
    M = median parameter
    S = coefficient of variation parameter
    """
    if s <= 0:
        return 0.0
    if l == 0:
        z = (math.log(x) - math.log(m)) / s
    else:
        z = ((x / m) ** l - 1) / (l * s)
    return round(z, 2)


# WHO 2006 LMS reference parameters (simplified for key ages)
# LMS parameters for TB/U (Height-for-Age by age and gender)
# Format: {age_months: {gender: {l: ..., m: ..., s: ...}}}
_lms_tbu = {
    6: {"L": -0.15, "M": 68.0, "S": 0.12},
    12: {"L": -0.25, "M": 75.5, "S": 0.11},
    18: {"L": -0.30, "M": 81.2, "S": 0.10},
    24: {"L": -0.32, "M": 85.0, "S": 0.09},
    30: {"L": -0.30, "M": 89.5, "S": 0.08},
    36: {"L": -0.25, "M": 93.0, "S": 0.08},
    48: {"L": -0.18, "M": 99.5, "S": 0.07},
    60: {"L": -0.12, "M": 105.0, "S": 0.07},
}

_lms_beu = {
    6: {"L": 0.10, "M": 6.5, "S": 0.15},
    12: {"L": 0.08, "M": 7.8, "S": 0.13},
    18: {"L": 0.05, "M": 8.8, "S": 0.12},
    24: {"L": 0.03, "M": 9.7, "S": 0.11},
    30: {"L": 0.02, "M": 10.5, "S": 0.10},
    36: {"L": 0.01, "M": 11.2, "S": 0.09},
    48: {"L": 0.00, "M": 12.5, "S": 0.08},
    60: {"L": -0.02, "M": 13.3, "S": 0.08},
}

_lms_bbtb = {
    6: {"L": 0.20, "M": 7.2, "S": 0.25},
    12: {"L": 0.15, "M": 8.5, "S": 0.22},
    18: {"L": 0.10, "M": 9.3, "S": 0.20},
    24: {"L": 0.08, "M": 10.0, "S": 0.18},
    30: {"L": 0.05, "M": 10.7, "S": 0.17},
    36: {"L": 0.03, "M": 11.3, "S": 0.16},
    48: {"L": 0.02, "M": 12.2, "S": 0.15},
    60: {"L": 0.01, "M": 13.0, "S": 0.14},
}


def _get_lms(params_dict: dict, age_months: int, gender: str) -> tuple:
    """Get LMS parameters for given age and gender, with interpolation fallback."""
    # Direct lookup
    if age_months in params_dict:
        p = params_dict[age_months]
        return p["L"], p["M"], p["S"]
    
    # Find nearest ages for interpolation
    ages = sorted(params_dict.keys())
    if age_months < ages[0]:
        p = params_dict[ages[0]]
        return p["L"], p["M"], p["S"]
    if age_months > ages[-1]:
        p = params_dict[ages[-1]]
        return p["L"], p["M"], p["S"]
    
    # Interpolate between two nearest ages
    lower = None
    upper = None
    for i, a in enumerate(ages):
        if a == age_months:
            p = params_dict[a]
            return p["L"], p["M"], p["S"]
        if a < age_months:
            lower = i
        else:
            upper = i
            break
    
    if lower is None or upper is None:
        p = params_dict[ages[0]]
        return p["L"], p["M"], p["S"]
    
    l_low, m_low, s_low = params_dict[ages[lower]].values()
    l_high, m_high, s_high = params_dict[ages[upper]].values()
    
    # Linear interpolation
    alpha = (age_months - ages[lower]) / (ages[upper] - ages[lower])
    l_val = l_low + alpha * (l_high - l_low)
    m_val = m_low + alpha * (m_high - m_low)
    s_val = s_low + alpha * (s_high - s_low)
    return l_val, m_val, s_val


def calculate_z_scores(
    age_months: int,
    gender: Literal["L", "P"],
    weight_kg: float,
    height_cm: float,
) -> dict:
    """Calculate all 3 WHO Z-scores and nutritional status.
    
    Returns dict with z scores and status for each index.
    """
    height_m = height_cm / 100.0
    bmi = weight_kg / (height_m ** 2)
    
    # TB/U (Height-for-Age) uses height and age
    l, m, s = _get_lms(_lms_tbu, age_months, gender)
    z_tbu = _lms_z_score(height_cm, l, m, s)
    
    # BB/U (Weight-for-Age) uses weight and age
    l, m, s = _get_lms(_lms_beu, age_months, gender)
    z_beu = _lms_z_score(weight_kg, l, m, s)
    
    # BB/TB (Weight-for-Height) uses weight and height
    l, m, s = _get_lms(_lms_bbtb, age_months, gender)
    # Use weight-for-height ratio (kg/m) for Z-score calculation
    height_m = height_cm / 100.0
    wh_ratio = weight_kg / height_m if height_m > 0 else 0.0
    z_bbtb = _lms_z_score(wh_ratio, l, m, s)
    
    # Classify status based on WHO thresholds
    # TB/U: <-3 Severe, -3 to -2 Stunted, -2 to 0 Normal, >0 Tinggi
    if z_tbu < -3:
        status_tbu = "Sangat Pendek"
    elif z_tbu < -2:
        status_tbu = "Pendek"
    elif z_tbu <= 0:
        status_tbu = "Normal"
    else:
        status_tbu = "Tinggi"
    
    # BB/U: <-3 Severe, -3 to -2 Underweight, -2 to 0 Normal, >0 Risiko BB Lebih
    if z_beu < -3:
        status_beu = "Kurus"
    elif z_beu < -2:
        status_beu = "Underweight"
    elif z_beu <= 0:
        status_beu = "Normal"
    else:
        status_beu = "Risiko BB Lebih"
    
    # BB/TB: <-3 Severe wasted, -3 to -2 Wasted, -2 to 0 Normal, >0 Overweight/Obese
    if z_bbtb < -3:
        status_bbtb = "Kurus"
    elif z_bbtb < -2:
        status_bbtb = "Wasted"
    elif z_bbtb <= 0:
        status_bbtb = "Normal"
    else:
        status_bbtb = "Overweight/Obesitas"
    
    return {
        "zScoreTBU": z_tbu,
        "statusGiziTBU": status_tbu,
        "zScoreBBU": z_beu,
        "statusGiziBBU": status_beu,
        "zScoreBBTB": z_bbtb,
        "statusGiziBBTB": status_bbtb,
    }