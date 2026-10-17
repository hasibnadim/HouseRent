// Rent estimator — loads trained LinearRegression weights from JSON for
// pure-JS inference at runtime (zero ML dependencies in the app).
// Falls back to the heuristic if the model file is missing/corrupt.
//
// Retrain: npm run train:estimator

import modelJson from "./estimator-model.json" with { type: "json" };

export const MODEL_VERSION = modelJson.modelVersion ?? "v1-mlr";
export const ESTIMATE_RANGE_PCT = 12;

export type EstimatorArea = {
  name: string;
  city: "Dhaka" | "Chattogram" | "Other";
  tier: "premium" | "standard" | "budget";
};

export const ESTIMATOR_AREAS: EstimatorArea[] = [
  { name: "Gulshan", city: "Dhaka", tier: "premium" },
  { name: "Banani", city: "Dhaka", tier: "premium" },
  { name: "Baridhara", city: "Dhaka", tier: "premium" },
  { name: "Dhanmondi", city: "Dhaka", tier: "premium" },
  { name: "Bashundhara", city: "Dhaka", tier: "standard" },
  { name: "Uttara", city: "Dhaka", tier: "standard" },
  { name: "Mohammadpur", city: "Dhaka", tier: "standard" },
  { name: "Mirpur", city: "Dhaka", tier: "budget" },
  { name: "Motijheel", city: "Dhaka", tier: "budget" },
  { name: "Wari", city: "Dhaka", tier: "budget" },
  { name: "Banasree", city: "Dhaka", tier: "standard" },
  { name: "Khilgaon", city: "Dhaka", tier: "budget" },
  { name: "GEC Circle", city: "Chattogram", tier: "premium" },
  { name: "Khulshi", city: "Chattogram", tier: "premium" },
  { name: "Agrabad", city: "Chattogram", tier: "standard" },
  { name: "Nasirabad", city: "Chattogram", tier: "standard" },
  { name: "Other", city: "Other", tier: "budget" },
];

export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "ROOM", "VILLA", "OTHER"] as const;
export type EstimatorPropertyType = (typeof PROPERTY_TYPES)[number];

export type EstimateInput = {
  area: string;
  sizeSqft: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: EstimatorPropertyType;
  furnished: boolean;
};

export type EstimateResult = {
  estimate: number;
  low: number;
  high: number;
  modelVersion: string;
};

const AREA_CODES: Record<string, number> = {
  Gulshan: 1, Banani: 2, Baridhara: 3, Dhanmondi: 4, Bashundhara: 5,
  Uttara: 6, Mohammadpur: 7, Mirpur: 8, Motijheel: 9, Wari: 10,
  Banasree: 11, Khilgaon: 12, "GEC Circle": 13, Khulshi: 14, Agrabad: 15,
  Nasirabad: 16, Halishahar: 17, Zindabazar: 18, Ambarkhana: 19, Shibganj: 20,
  Sonadanga: 21, Khalishpur: 22, "Shaheb Bazar": 23, Uposhohor: 24,
  "Sadar Road": 25, Nathullabad: 26, "Jahaj Company Mor": 27, Dhap: 28,
  "Ganginar Par": 29, Charpara: 30,
};
const TYPE_CODES: Record<string, number> = {
  APARTMENT: 1, HOUSE: 2, ROOM: 3, VILLA: 4, OTHER: 5,
};

const RATE_PER_SQFT: Record<EstimatorArea["tier"], number> = {
  premium: 32,
  standard: 25,
  budget: 19,
};
const TYPE_MULTIPLIER: Record<EstimatorPropertyType, number> = {
  APARTMENT: 1,
  HOUSE: 1.15,
  ROOM: 0.55,
  VILLA: 1.5,
  OTHER: 1,
};

function round100(value: number): number {
  return Math.max(500, Math.round(value / 100) * 100);
}

function isUsableModel(): boolean {
  const weights = (modelJson as { weights?: unknown }).weights;
  return (
    Array.isArray(weights) &&
    weights.length === 8 &&
    weights.every((w) => typeof w === "number" && Number.isFinite(w))
  );
}

export function validateEstimateInput(input: EstimateInput): string | null {
  if (!ESTIMATOR_AREAS.some((area) => area.name === input.area)) {
    return "Choose an area from the list.";
  }
  if (!Number.isInteger(input.sizeSqft) || input.sizeSqft < 100 || input.sizeSqft > 10000) {
    return "Size must be between 100 and 10,000 sqft.";
  }
  if (!Number.isInteger(input.bedrooms) || input.bedrooms < 0 || input.bedrooms > 10) {
    return "Bedrooms must be between 0 and 10.";
  }
  if (!Number.isInteger(input.bathrooms) || input.bathrooms < 0 || input.bathrooms > 10) {
    return "Bathrooms must be between 0 and 10.";
  }
  if (!PROPERTY_TYPES.includes(input.propertyType)) {
    return "Choose a valid property type.";
  }
  return null;
}

function heuristicEstimate(input: EstimateInput): number {
  const area = ESTIMATOR_AREAS.find((row) => row.name === input.area) ?? ESTIMATOR_AREAS[ESTIMATOR_AREAS.length - 1]!;
  const base = input.sizeSqft * RATE_PER_SQFT[area.tier] + input.bedrooms * 1200 + input.bathrooms * 700;
  const adjusted = base * TYPE_MULTIPLIER[input.propertyType] * (input.furnished ? 1.12 : 1);
  return round100(adjusted);
}

function mlEstimate(input: EstimateInput): number | null {
  if (!isUsableModel()) return null;
  const weights = (modelJson as { weights: number[] }).weights;
  const features = [
    AREA_CODES[input.area] ?? 0,
    input.sizeSqft,
    input.bedrooms,
    input.bathrooms,
    TYPE_CODES[input.propertyType] ?? 0,
    input.furnished ? 1 : 0,
    0, // amenityCount — not collected on the estimate form; mean-imputed
  ];
  // weights[0..6] are feature weights; weights[7] is the intercept.
  let prediction = weights[7]!;
  for (let i = 0; i < 7; i++) {
    prediction += weights[i]! * features[i]!;
  }
  if (!Number.isFinite(prediction)) return null;
  return round100(prediction);
}

export function estimateRent(input: EstimateInput): EstimateResult {
  const estimate = mlEstimate(input) ?? heuristicEstimate(input);
  return {
    estimate,
    low: round100(estimate * (1 - ESTIMATE_RANGE_PCT / 100)),
    high: round100(estimate * (1 + ESTIMATE_RANGE_PCT / 100)),
    modelVersion: isUsableModel() ? MODEL_VERSION : "v0-heuristic",
  };
}
