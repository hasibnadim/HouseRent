"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, History, Info, Sparkles } from "lucide-react";
import {
  ESTIMATOR_AREAS,
  PROPERTY_TYPES,
  estimateRent,
  validateEstimateInput,
  type EstimateInput,
  type EstimateResult,
} from "@/lib/estimator";
import { SearchableAreaSelect } from "./searchable-area-select";

type HistoryEntry = {
  summary: string;
  estimate: number;
  at: string;
};

const HISTORY_KEY = "liveair-estimates";

function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

const LIGHT_INPUT =
  "w-full min-h-[48px] rounded-xl border border-[#e2e0d7] bg-white px-4 text-[14px] text-[#153b3c] outline-none transition-all duration-200 placeholder:text-[#b7bdb8] hover:border-[#c9d4cc] focus:border-[#12aeb0] focus:shadow-[0_0_0_4px_rgb(18_174_176/15%)]";
const LIGHT_LABEL = "grid gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#53635c]";
const LIGHT_SELECT =
  "w-full min-h-[48px] appearance-none rounded-xl border border-[#e2e0d7] bg-white px-4 pr-10 text-[14px] text-[#153b3c] outline-none transition-all duration-200 hover:border-[#c9d4cc] focus:border-[#12aeb0] focus:shadow-[0_0_0_4px_rgb(18_174_176/15%)]";

export function EstimatorForm() {
  const [area, setArea] = useState("Dhanmondi");
  const [sizeSqft, setSizeSqft] = useState("1200");
  const [bedrooms, setBedrooms] = useState("3");
  const [bathrooms, setBathrooms] = useState("2");
  const [propertyType, setPropertyType] = useState("APARTMENT");
  const [furnished, setFurnished] = useState(false);
  const [amenities, setAmenities] = useState("");
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
    const amenityCount = amenities
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean).length;
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
      summary: `${area} · ${input.sizeSqft} sqft · ${input.bedrooms} bed · ${typeLabel(input.propertyType)} · ${amenityCount} amenities${input.furnished ? " · furnished" : ""}`,
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
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-2xl border border-[#e7e2d4] bg-[#fffefa] p-6 shadow-[0_8px_32px_rgb(39_66_53/8%)] sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#12aeb0]/10 text-[#12aeb0]">
            <Sparkles size={15} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0d7f81]">
            AI-Powered
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className={LIGHT_LABEL}>
            Area
            <SearchableAreaSelect value={area} onChange={setArea} />
          </label>

          <div className="grid gap-5 sm:grid-cols-3">
            <label className={LIGHT_LABEL}>
              Size (sqft)
              <input className={LIGHT_INPUT} value={sizeSqft} onChange={(event) => setSizeSqft(event.target.value)} inputMode="numeric" placeholder="1200" />
            </label>
            <label className={LIGHT_LABEL}>
              Bedrooms
              <input className={LIGHT_INPUT} value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} inputMode="numeric" placeholder="3" />
            </label>
            <label className={LIGHT_LABEL}>
              Bathrooms
              <input className={LIGHT_INPUT} value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} inputMode="numeric" placeholder="2" />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={LIGHT_LABEL}>
              Property type
              <div className="relative">
                <select className={LIGHT_SELECT} value={propertyType} onChange={(event) => setPropertyType(event.target.value)}>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {typeLabel(type)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#b7bdb8]">▾</span>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 pt-6 text-[13px] font-medium text-[#345451]">
              <button
                type="button"
                role="switch"
                aria-checked={furnished}
                onClick={() => setFurnished(!furnished)}
                className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${furnished ? "bg-[#12aeb0]" : "bg-[#dce3da]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${furnished ? "translate-x-5" : ""}`} />
              </button>
              Furnished property
            </label>
          </div>

          <label className={LIGHT_LABEL}>
            Amenities <span className="normal-case text-[#b7bdb8]">(comma separated)</span>
            <input
              className={LIGHT_INPUT}
              value={amenities}
              onChange={(event) => setAmenities(event.target.value)}
              placeholder="WiFi, Lift, Generator, Parking, AC, Geyser"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-xl border-l-[3px] border-l-[#d95e3b] bg-[#fff0e9] px-4 py-3 text-[13px] text-[#934229]">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="group relative inline-flex min-h-[52px] items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#f07845] to-[#dc6031] px-6 text-[14px] font-bold text-white shadow-[0_8px_24px_rgb(240_120_69/30%)] transition-all duration-300 hover:shadow-[0_12px_32px_rgb(240_120_69/45%)] active:scale-[0.98]"
          >
            <Sparkles size={16} />
            Get AI Estimate
          </button>
        </form>
      </section>

      <aside className="grid gap-4">
        <div className="rounded-2xl border border-[#e7e2d4] bg-[#fffefa] p-6 shadow-[0_8px_32px_rgb(39_66_53/8%)]">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#12aeb0]/10 text-[#12aeb0]">
              <Sparkles size={15} />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#53635c]">Estimated monthly rent</p>
          </div>
          {result ? (
            <>
              <p className="mt-3 text-[44px] font-bold leading-none text-[#153b3c]">
                ৳{result.estimate.toLocaleString()}
              </p>
              <p className="mt-3 text-[13px] text-[#7a8a82]">
                Plausible range: <strong className="text-[#153b3c]">৳{result.low.toLocaleString()} – ৳{result.high.toLocaleString()}</strong>
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#12aeb0]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#0d7f81]">
                <Sparkles size={12} /> Model {result.modelVersion}
              </p>
              <Link
                href={similarHref}
                className="mt-5 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f07845] to-[#dc6031] px-4 text-[14px] font-bold text-white shadow-[0_8px_24px_rgb(240_120_69/25%)] transition-all duration-300 hover:shadow-[0_12px_32px_rgb(240_120_69/40%)] active:scale-[0.98]"
              >
                Find similar homes <ArrowUpRight size={15} />
              </Link>
            </>
          ) : (
            <div className="mt-4 grid gap-3">
              <p className="text-[14px] leading-relaxed text-[#6b7770]">
                Fill in the details and get an instant AI-powered rent estimate.
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-[#e7e2d4] bg-[#fbfaf5] p-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#12aeb0] opacity-30" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#12aeb0]" />
                </span>
                <span className="text-[12px] text-[#7a8a82]">Model ready — trained on 16,002 listings</span>
              </div>
            </div>
          )}
        </div>
        <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#7a8a82]">
          <Info size={14} className="mt-0.5 shrink-0 text-[#12aeb0]" />
          An estimate, not a price guarantee. Actual rents vary with building age, floor,
          facing, exact road and negotiation.
        </p>
        {history.length > 0 && (
          <div className="rounded-2xl border border-[#e7e2d4] bg-[#fffefa] p-5">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#53635c]">
              <History size={14} className="text-[#12aeb0]" /> Recent estimates
            </p>
            <ul className="mt-3 grid gap-2.5">
              {history.map((entry, index) => (
                <li key={`${entry.at}-${index}`} className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="min-w-0 truncate text-[#7a8a82]">{entry.summary}</span>
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
