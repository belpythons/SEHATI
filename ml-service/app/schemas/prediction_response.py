from pydantic import BaseModel
from typing import Literal


# Z-Score Results
class ZScoreResult(BaseModel):
    zScore: float
    statusGizi: Literal['Sangat Pendek', 'Pendek', 'Normal', 'Tinggi']


# Triple-Index Z-Score Response
class TripleZScoreResponse(BaseModel):
    zScoreTBU: float
    statusGiziTBU: Literal['Sangat Pendek', 'Pendek', 'Normal', 'Tinggi']
    zScoreBBU: float
    statusGiziBBU: Literal['Kurus', 'Underweight', 'Normal', 'Risiko BB Lebih']
    zScoreBBTB: float
    statusGiziBBTB: Literal['Kurus', 'Wasted', 'Normal', 'Overweight/Obesitas']


# Risk Assessment Response
class RiskScoreResponse(BaseModel):
    riskScore: float
    riskTier: Literal['LOW', 'MODERATE', 'HIGH']
    dominantFactors: list[str]


# Full Prediction Response
class PredictionResponse(BaseModel):
    zScoreTBU: float
    statusGiziTBU: Literal['Sangat Pendek', 'Pendek', 'Normal', 'Tinggi']
    zScoreBBU: float
    statusGiziBBU: Literal['Kurus', 'Underweight', 'Normal', 'Risiko BB Lebih']
    zScoreBBTB: float
    statusGiziBBTB: Literal['Kurus', 'Wasted', 'Normal', 'Overweight/Obesitas']
    riskScore: float
    riskTier: Literal['LOW', 'MODERATE', 'HIGH']
    dominantFactors: list[str]
