"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { ESTIMATOR_AREAS } from "@/lib/estimator";

type Group = {
  city: string;
  areas: string[];
};

const GROUPS: Group[] = [
  { city: "Dhaka", areas: ESTIMATOR_AREAS.filter((a) => a.city === "Dhaka").map((a) => a.name) },
  { city: "Chattogram", areas: ESTIMATOR_AREAS.filter((a) => a.city === "Chattogram").map((a) => a.name) },
  { city: "Other", areas: ESTIMATOR_AREAS.filter((a) => a.city === "Other").map((a) => a.name) },
];

export function SearchableAreaSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (area: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = GROUPS.map((group) => ({
    ...group,
    areas: group.areas.filter((area) =>
      area.toLowerCase().includes(query.toLowerCase()),
    ),
  })).filter((group) => group.areas.length > 0);

  const selectedArea = ESTIMATOR_AREAS.find((a) => a.name === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full min-h-[48px] items-center justify-between gap-2 rounded-xl border border-[#e2e0d7] bg-white px-4 text-[14px] text-[#153b3c] transition-all duration-200 hover:border-[#c9d4cc] focus:border-[#12aeb0] focus:shadow-[0_0_0_4px_rgb(18_174_176/15%)]"
      >
        <span className="flex items-center gap-2">
          {selectedArea && (
            <span className="rounded-full bg-[#12aeb0]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0d7f81]">
              {selectedArea.city}
            </span>
          )}
          <span>{value || "Select area"}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#b7bdb8] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[#e7e2d4] bg-white shadow-[0_16px_48px_rgb(39_66_53/15%)]">
          <div className="flex items-center gap-2 border-b border-[#f0ede2] px-4 py-3">
            <Search size={15} className="shrink-0 text-[#b7bdb8]" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search areas…"
              className="w-full bg-transparent text-[13px] text-[#153b3c] outline-none placeholder:text-[#b7bdb8]"
            />
          </div>
          <div className="max-h-[280px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-[#b7bdb8]">
                No areas match "{query}"
              </p>
            ) : (
              filtered.map((group) => (
                <div key={group.city}>
                  <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a9a92]">
                    {group.city}
                  </p>
                  {group.areas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => {
                        onChange(area);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors ${
                        area === value
                          ? "bg-[#12aeb0]/10 font-semibold text-[#0d7f81]"
                          : "text-[#345451] hover:bg-[#f4f2ec]"
                      }`}
                    >
                      {area}
                      {area === value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#12aeb0]" />
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
