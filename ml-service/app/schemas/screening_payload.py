from pydantic import BaseModel, Field
from typing import Literal


class ScreeningPayload(BaseModel):
    ageMonths: int = Field(..., description="Umur bayi dalam bulan")
    gender: Literal["L", "P"] = Field(..., description="Jenis kelamin: L = Laki-laki, P = Perempuan")
    weightKg: float = Field(..., description="Berat badan dalam kg")
    heightCm: float = Field(..., description="Tinggi badar dalam cm")

    exclusiveAsi: bool = Field(..., description="Apakasi ASI eksklusif")
    sanitationAccess: bool = Field(..., description="Akses sanitasi")
    cleanWaterAccess: bool = Field(..., description="Akses air bersih")
    smokeExposure: bool = Field(..., description="Paparan Rokok")
    economicQuintile: int = Field(..., description="Quintile ekonomi (1-5)")
    motherEducation: bool = Field(..., description="Pendidikan Ibu")
    diarrheaHistory: bool = Field(..., description="Sejarah diare")
    bblrHistory: bool = Field(..., description="Sejarah BBLR")

    class Config:
        json_schema_extra = {
            "example": {
                "ageMonths": 18,
                "gender": "L",
                "weightKg": 8.5,
                "heightCm": 74.5,
                "exclusiveAsi": True,
                "sanitationAccess": False,
                "cleanWaterAccess": True,
                "smokeExposure": True,
                "economicQuintile": 2,
                "motherEducation": True,
                "diarrheaHistory": False,
            }
        }