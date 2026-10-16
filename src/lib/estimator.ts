// Rent estimator — transparent heuristic (model v0).
//
// req.md calls for a Python-trained LinearRegression exported as JSON weights with
// pure-JS inference. Until that model file ships, this module provides a documented
// area-based heuristic with the same input/output shape, so the /estimate page,
// "find similar" links and (later) the listing-price pre-fill all keep working.
// To upgrade: replace estimateRent's internals with JSON-weight inference and bump
// MODEL_VERSION — the signature stays stable.

export const MODEL_VERSION = "v0-heuristic";
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

export function estimateRent(input: EstimateInput): EstimateResult {
  const area = ESTIMATOR_AREAS.find((row) => row.name === input.area) ?? ESTIMATOR_AREAS[ESTIMATOR_AREAS.length - 1]!;
  const base = input.sizeSqft * RATE_PER_SQFT[area.tier] + input.bedrooms * 1200 + input.bathrooms * 700;
  const adjusted = base * TYPE_MULTIPLIER[input.propertyType] * (input.furnished ? 1.12 : 1);

  const estimate = round100(adjusted);
  return {
    estimate,
    low: round100(estimate * (1 - ESTIMATE_RANGE_PCT / 100)),
    high: round100(estimate * (1 + ESTIMATE_RANGE_PCT / 100)),
    modelVersion: MODEL_VERSION,
  };
}
