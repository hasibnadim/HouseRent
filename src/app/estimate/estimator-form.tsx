"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calculator, History, Info } from "lucide-react";
import {
  ESTIMATOR_AREAS,
  PROPERTY_TYPES,
  estimateRent,
  validateEstimateInput,
  type EstimateInput,
  type EstimateResult,
} from "@/lib/estimator";

type HistoryEntry = {
  summary: string;
  estimate: number;
  at: string;
};

const HISTORY_KEY = "liveair-estimates";

function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

const inputClass =
  "w-full min-h-[44px] rounded-lg border border-[#dce3da] bg-white px-3 text-[14px] text-[#153b3c] outline-none focus:border-[#12aeb0] focus:shadow-[0_0_0_3px_rgb(18_174_176/12%)]";
const labelClass = "grid gap-1.5 text-[12px] font-semibold text-[#294946]";

export function EstimatorForm() {
  const [area, setArea] = useState("Dhanmondi");
  const [sizeSqft, setSizeSqft] = useState("1200");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("2");
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [furnished, setFurnished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<(EstimateResult & { area: string }) | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      // Corrupt history should never break the page.
    }
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const input: EstimateInput = {
      area,
      sizeSqft: Number(sizeSqft),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      propertyType: propertyType as EstimateInput["propertyType"],
      furnished,
    };
    const message = validateEstimateInput(input);
    if (message) {
      setError(message);
      setResult(null);
      return;
    }
    setError(null);
    const estimate = estimateRent(input);
    setResult({ ...estimate, area });
    const entry: HistoryEntry = {
      summary: `${area} · ${input.sizeSqft} sqft · ${input.bedrooms} bed · ${typeLabel(input.propertyType)}${input.furnished ? " · furnished" : ""}`,
      estimate: estimate.estimate,
      at: new Date().toISOString(),
    };
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, 5);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // Private mode etc. — history is best-effort.
      }
      return next;
    });
  }

  const areaCity = ESTIMATOR_AREAS.find((row) => row.name === (result?.area ?? area))?.city;
  const similarHref =
    result && areaCity && areaCity !== "Other"
      ? `/search?city=${encodeURIComponent(areaCity)}&minRent=${result.low}&maxRent=${result.high}`
      : "/search";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-xl border border-[#e7e2d4] bg-[#fffefa] p-6 shadow-[0_4px_16px_rgb(39_66_53/5%)]">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className={labelClass}>
            Area
            <select className={inputClass} value={area} onChange={(event) => setArea(event.target.value)}>
              {(["Dhaka", "Chattogram", "Other"] as const).map((city) => (
                <optgroup key={city} label={city}>
                  {ESTIMATOR_AREAS.filter((row) => row.city === city).map((row) => (
                    <option key={row.name} value={row.name}>
                      {row.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelClass}>
              Size (sqft)
              <input
                className={inputClass}
                value={sizeSqft}
                onChange={(event) => setSizeSqft(event.target.value)}
                inputMode="numeric"
                placeholder="1200"
              />
            </label>
            <label className={labelClass}>
              Bedrooms
              <input
                className={inputClass}
                value={bedrooms}
                onChange={(event) => setBedrooms(event.target.value)}
                inputMode="numeric"
                placeholder="3"
              />
            </label>
            <label className={labelClass}>
              Bathrooms
              <input
                className={inputClass}
                value={bathrooms}
                onChange={(event) => setBathrooms(event.target.value)}
                inputMode="numeric"
                placeholder="2"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Property type
              <select
                className={inputClass}
                value={propertyType}
                onChange={(event) => setPropertyType(event.target.value)}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 pt-6 text-[13px] font-semibold text-[#294946]">
              <input
                type="checkbox"
                checked={furnished}
                onChange={(event) => setFurnished(event.target.checked)}
                className="h-[17px] w-[17px] accent-[#12aeb0]"
              />
              Furnished property
            </label>
          </div>
          {error && (
            <p role="alert" className="rounded-lg border-l-[3px] border-l-[#d95e3b] bg-[#fff0e9] px-3 py-2.5 text-[13px] text-[#934229]">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#f07845] px-5 text-[13px] font-bold text-[#fffefa] transition hover:bg-[#dc6031]"
          >
            <Calculator size={15} /> Get estimate
          </button>
        </form>
      </section>

      <aside className="grid gap-4">
        <div className="rounded-xl bg-[#153b3c] p-6 text-[#cfe0da] shadow-[0_12px_32px_rgb(21_59_60/20%)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8fb7ae]">Estimated monthly rent</p>
          {result ? (
            <>
              <p className="mt-2 text-[38px] font-bold leading-none text-[#fffefa]">
                ৳{result.estimate.toLocaleString()}
              </p>
              <p className="mt-2 text-[13px]">
                Plausible range: <strong className="text-[#fffefa]">৳{result.low.toLocaleString()} – ৳{result.high.toLocaleString()}</strong>
              </p>
              <p className="mt-3 inline-block rounded-full bg-[rgb(255_254_250/10%)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#a6e2d9]">
                Model {result.modelVersion}
              </p>
              <Link
                href={similarHref}
                className="mt-4 flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#f07845] px-4 text-[13px] font-bold text-[#fffefa] transition hover:bg-[#dc6031]"
              >
                Find similar homes <ArrowUpRight size={15} />
              </Link>
            </>
          ) : (
            <p className="mt-2 text-[14px] leading-relaxed">
              Fill in the details and get an instant rent estimate for the area.
            </p>
          )}
        </div>
        <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#7a8a82]">
          <Info size={14} className="mt-0.5 shrink-0 text-[#12aeb0]" />
          An estimate, not a price guarantee. Actual rents vary with building age, floor,
          facing, exact road and negotiation.
        </p>
        {history.length > 0 && (
          <div className="rounded-xl border border-[#e7e2d4] bg-[#fffefa] p-5">
            <p className="flex items-center gap-2 text-[12px] font-bold text-[#153b3c]">
              <History size={14} className="text-[#12aeb0]" /> Recent estimates
            </p>
            <ul className="mt-3 grid gap-2.5">
              {history.map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="min-w-0 truncate text-[#53635c]">{entry.summary}</span>
                  <strong className="shrink-0 text-[#153b3c]">৳{entry.estimate.toLocaleString()}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
