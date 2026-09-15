import { kelurahanBontang } from "../constants/bontang";

export const GENDER_ALIASES: Record<string, string> = {
  L: "Laki-Laki",
  M: "Laki-Laki",
  MALE: "Laki-Laki",
  LAKI: "Laki-Laki",
  LAKI_LAKI: "Laki-Laki",
  "LAKI-LAKI": "Laki-Laki",
  "LAKI LAKI": "Laki-Laki",
  P: "Perempuan",
  F: "Perempuan",
  FEMALE: "Perempuan",
  PEREMPUAN: "Perempuan",
};

export function normalizeGender(value: unknown): string {
  if (typeof value !== "string") return "";
  const key = value.trim().toUpperCase().replace(/\s+/g, " ");
  const canonical = GENDER_ALIASES[key];
  if (canonical) return canonical;
  const titleCased = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
  return titleCased === "Laki-Laki" || titleCased === "Perempuan" ? titleCased : value.trim();
}

export function normalizeKelurahan(value: unknown): string {
  if (typeof value !== "string") return "";
  const raw = value.trim();
  const match = kelurahanBontang.find(
    (k) => k.toLowerCase() === raw.toLowerCase()
  );
  return match ?? raw;
}

export function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "ya" || normalized === "y";
}

export function toNumberOrElse(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return !isNaN(parsed) && value !== null && value !== "" && value !== undefined ? parsed : fallback;
}