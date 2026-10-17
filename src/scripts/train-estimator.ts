// Trains a multivariate linear regression model directly from the database
// and writes the model weights to src/lib/estimator-model.json.
//
// Split: 50% train / 50% test.
// Reports regression metrics (R², MAE, RMSE) and classification metrics
// (accuracy, precision, recall, F1) by binning rents into price brackets.
//
// Run: npm run train:estimator

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import pkg from "ml-regression";
import { db } from "../prisma/db.ts";

const { MultivariateLinearRegression } = pkg as typeof pkg & {
  MultivariateLinearRegression: new (
    x: number[][],
    y: number[][],
  ) => { predict: (x: number[]) => number[]; weights: number[][]; intercept: number };
};

// Must stay in sync with the encoding in estimator.ts.
// Note: 'city' is dropped — it's perfectly collinear with 'area' (each area
// belongs to exactly one city), which makes X^T X singular.
const FEATURES = [
  "area",
  "sizeSqft",
  "bedrooms",
  "bathrooms",
  "propertyType",
  "furnished",
  "amenityCount",
] as const;

type Row = {
  area: string;
  sizeSqft: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  furnished: boolean;
  amenityCount: number;
  monthlyRent: number;
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

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Regression metrics ──────────────────────────────────────────────────────

function regressionMetrics(yTrue: number[], yPred: number[]) {
  const n = yTrue.length;
  const mean = yTrue.reduce((a, b) => a + b, 0) / n;
  const ssTot = yTrue.reduce((acc, v) => acc + (v - mean) ** 2, 0);
  const ssRes = yTrue.reduce((acc, v, i) => acc + (v - yPred[i]!) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  const mae = yTrue.reduce((acc, v, i) => acc + Math.abs(v - yPred[i]!), 0) / n;
  const rmse = Math.sqrt(yTrue.reduce((acc, v, i) => acc + (v - yPred[i]!) ** 2, 0) / n);
  return { r2, mae, rmse };
}

// ── Classification metrics (price-bracket bins) ─────────────────────────────
//
// Since LinearRegression is a regression model, we bin both predicted and actual
// rents into 3 brackets to compute classification metrics:
//   Budget   : < 20,000 BDT
//   Standard : 20,000 – 40,000 BDT
//   Premium  : > 40,000 BDT

const BINS = ["Budget", "Standard", "Premium"] as const;
type Bin = (typeof BINS)[number];

function toBin(rent: number): Bin {
  if (rent < 20000) return "Budget";
  if (rent <= 40000) return "Standard";
  return "Premium";
}

function classificationMetrics(yTrue: number[], yPred: number[]) {
  const n = yTrue.length;
  const perBin = new Map<Bin, { tp: number; fp: number; fn: number }>();

  for (const bin of BINS) {
    perBin.set(bin, { tp: 0, fp: 0, fn: 0 });
  }

  for (let i = 0; i < n; i++) {
    const actual = toBin(yTrue[i]!);
    const predicted = toBin(yPred[i]!);
    for (const bin of BINS) {
      const counts = perBin.get(bin)!;
      if (predicted === bin && actual === bin) counts.tp++;
      else if (predicted === bin && actual !== bin) counts.fp++;
      else if (predicted !== bin && actual === bin) counts.fn++;
    }
  }

  const rows: { bin: Bin; precision: number; recall: number; f1: number }[] = [];
  let macroPrecision = 0;
  let macroRecall = 0;
  let macroF1 = 0;
  let totalCorrect = 0;

  for (const bin of BINS) {
    const { tp, fp, fn } = perBin.get(bin)!;
    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
    rows.push({ bin, precision, recall, f1 });
    macroPrecision += precision;
    macroRecall += recall;
    macroF1 += f1;
    totalCorrect += tp;
  }

  return {
    accuracy: totalCorrect / n,
    macroPrecision: macroPrecision / BINS.length,
    macroRecall: macroRecall / BINS.length,
    macroF1: macroF1 / BINS.length,
    perBin: rows,
  };
}

// ── Main ────────────────────────────────────────────────────────────────────

function toVector(r: Row): number[] {
  return [
    AREA_CODES[r.area] ?? 0,
    r.sizeSqft,
    r.bedrooms,
    r.bathrooms,
    TYPE_CODES[r.propertyType] ?? 0,
    r.furnished ? 1 : 0,
    r.amenityCount,
  ];
}

async function main() {
  console.log("Fetching listings from database...");
  const listings = await db.orm.mytour.Listing.select(
    "area", "sizeSqft", "bedrooms", "bathrooms", "propertyType", "furnished", "amenities", "monthlyRent",
  ).all();

  const rows: Row[] = listings.map((l) => ({
    area: l.area,
    sizeSqft: l.sizeSqft,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    propertyType: l.propertyType,
    furnished: l.furnished,
    amenityCount: l.amenities.length,
    monthlyRent: l.monthlyRent,
  }));

  console.log(`Loaded ${rows.length} rows from database`);

  // Shuffle deterministically
  const rand = mulberry32(20261016);
  const shuffled = [...rows];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }

  // 50/50 split
  const splitAt = Math.floor(shuffled.length * 0.5);
  const train = shuffled.slice(0, splitAt);
  const test = shuffled.slice(splitAt);
  console.log(`Split: ${train.length} train / ${test.length} test (50/50)\n`);

  // Train
  console.log("Training MultivariateLinearRegression...");
  const X = train.map(toVector);
  const Y = train.map((r) => [r.monthlyRent]);
  const model = new MultivariateLinearRegression(X, Y);
  console.log("Training complete.\n");

  // Test
  console.log("Evaluating on test set...");
  const testPred = test.map((r) => model.predict(toVector(r))[0]!);
  const testTrue = test.map((r) => r.monthlyRent);

  // Regression metrics
  const reg = regressionMetrics(testTrue, testPred);
  console.log("Regression metrics:");
  console.log(`  R²   = ${reg.r2.toFixed(4)}`);
  console.log(`  MAE  = ${Math.round(reg.mae).toLocaleString()} BDT`);
  console.log(`  RMSE = ${Math.round(reg.rmse).toLocaleString()} BDT\n`);

  // Classification metrics
  const cls = classificationMetrics(testTrue, testPred);
  console.log("Classification metrics (price brackets: Budget <20k, Standard 20-40k, Premium >40k):");
  console.log(`  Accuracy  = ${(cls.accuracy * 100).toFixed(2)}%`);
  console.log(`  Precision (macro) = ${(cls.macroPrecision * 100).toFixed(2)}%`);
  console.log(`  Recall    (macro) = ${(cls.macroRecall * 100).toFixed(2)}%`);
  console.log(`  F1        (macro) = ${(cls.macroF1 * 100).toFixed(2)}%\n`);

  console.log("Per-bracket breakdown:");
  console.log("  Bracket    Precision    Recall    F1");
  for (const row of cls.perBin) {
    console.log(
      `  ${row.bin.padEnd(10)}  ${(row.precision * 100).toFixed(2).padStart(7)}%  ${(row.recall * 100).toFixed(2).padStart(7)}%  ${(row.f1 * 100).toFixed(2).padStart(7)}%`,
    );
  }

  // Export model
  const weights = model.weights.map((w) => w[0]!);
  const modelJson = {
    modelVersion: "v1-mlr",
    trainedAt: new Date().toISOString(),
    features: [...FEATURES],
    weights,
    intercept: model.intercept,
    trainRows: train.length,
    testRows: test.length,
    split: "50/50",
    metrics: {
      regression: { r2: reg.r2, mae: reg.mae, rmse: reg.rmse },
      classification: {
        accuracy: cls.accuracy,
        macroPrecision: cls.macroPrecision,
        macroRecall: cls.macroRecall,
        macroF1: cls.macroF1,
      },
    },
  };

  const outPath = join(process.cwd(), "src/lib/estimator-model.json");
  writeFileSync(outPath, JSON.stringify(modelJson, null, 2), "utf-8");
  console.log(`\nModel written to ${outPath}`);

  await db.close();
}

main().catch(async (error) => {
  console.error(error);
  await db.close();
  process.exit(1);
});
