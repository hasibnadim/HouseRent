import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Building2, SearchX, SlidersHorizontal } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ListingCard } from "@/components/listing-card";
import { Pager } from "@/components/pager";
import {
  LISTING_PAGE_SIZE,
  searchListings,
  type ListingFilters,
} from "@/lib/listings";
import { SortSelect } from "./sort-select";

export const instant = false;

type RawParams = Record<string, string | string[] | undefined>;

function first(params: RawParams, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function parseFilters(params: RawParams): ListingFilters {
  const type = first(params, "type");
  const sort = first(params, "sort");
  const page = parseNumber(first(params, "page")) ?? 1;
  return {
    q: first(params, "q").slice(0, 80),
    city: first(params, "city").slice(0, 80),
    area: first(params, "area").slice(0, 80),
    minRent: parseNumber(first(params, "minRent")),
    maxRent: parseNumber(first(params, "maxRent")),
    beds: parseNumber(first(params, "beds")),
    baths: parseNumber(first(params, "baths")),
    type: ["APARTMENT", "HOUSE", "ROOM", "VILLA", "OTHER"].includes(type) ? type : "",
    furnished: first(params, "furnished") === "on",
    sort: sort === "rent-asc" || sort === "rent-desc" ? sort : "newest",
    page: Math.min(Math.max(page, 1), 500),
  };
}

function toHref(filters: ListingFilters, overrides: Partial<ListingFilters>): string {
  const merged: ListingFilters = { ...filters, ...overrides };
  const query = new URLSearchParams();
  if (merged.q) query.set("q", merged.q);
  if (merged.city) query.set("city", merged.city);
  if (merged.area) query.set("area", merged.area);
  if (merged.minRent != null) query.set("minRent", String(merged.minRent));
  if (merged.maxRent != null) query.set("maxRent", String(merged.maxRent));
  if (merged.beds != null) query.set("beds", String(merged.beds));
  if (merged.baths != null) query.set("baths", String(merged.baths));
  if (merged.type) query.set("type", merged.type);
  if (merged.furnished) query.set("furnished", "on");
  if (merged.sort !== "newest") query.set("sort", merged.sort);
  if (merged.page > 1) query.set("page", String(merged.page));
  const text = query.toString();
  return text ? `/search?${text}` : "/search";
}

const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "ROOM", "VILLA", "OTHER"] as const;

function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const filters = parseFilters(await searchParams);

  return (
    <main className="browse">
      <SiteHeader />

      <div className="browse-head section-wrap">
        <div>
          <span className="eyebrow">BROWSE HOMES FOR RENT</span>
          <h1>Find a place to feel at home.</h1>
          <p>Homes for rent across Bangladesh — filter by area, budget and space.</p>
        </div>
        <SortSelect
          value={filters.sort}
          hidden={[
            ...(filters.q ? [{ name: "q", value: filters.q }] : []),
            ...(filters.city ? [{ name: "city", value: filters.city }] : []),
            ...(filters.area ? [{ name: "area", value: filters.area }] : []),
            ...(filters.minRent != null ? [{ name: "minRent", value: String(filters.minRent) }] : []),
            ...(filters.maxRent != null ? [{ name: "maxRent", value: String(filters.maxRent) }] : []),
            ...(filters.beds != null ? [{ name: "beds", value: String(filters.beds) }] : []),
            ...(filters.baths != null ? [{ name: "baths", value: String(filters.baths) }] : []),
            ...(filters.type ? [{ name: "type", value: filters.type }] : []),
            ...(filters.furnished ? [{ name: "furnished", value: "on" }] : []),
          ]}
        />
      </div>

      <div className="browse-layout section-wrap">
        <aside className="browse-filters" aria-label="Search filters">
          <p className="browse-filters-title">
            <SlidersHorizontal size={15} /> Filters
          </p>
          <form action="/search" method="get">
            <label className="browse-field">
              <span>Keyword</span>
              <input name="q" defaultValue={filters.q} placeholder="Title, area, city…" maxLength={80} />
            </label>
            <div className="browse-field-row">
              <label className="browse-field">
                <span>City</span>
                <input name="city" defaultValue={filters.city} placeholder="Dhaka" maxLength={80} />
              </label>
              <label className="browse-field">
                <span>Area</span>
                <input name="area" defaultValue={filters.area} placeholder="Dhanmondi" maxLength={80} />
              </label>
            </div>
            <div className="browse-field-row">
              <label className="browse-field">
                <span>Min rent (BDT)</span>
                <input name="minRent" defaultValue={filters.minRent ?? ""} inputMode="numeric" placeholder="10000" />
              </label>
              <label className="browse-field">
                <span>Max rent (BDT)</span>
                <input name="maxRent" defaultValue={filters.maxRent ?? ""} inputMode="numeric" placeholder="60000" />
              </label>
            </div>
            <div className="browse-field-row">
              <label className="browse-field">
                <span>Beds (min)</span>
                <input name="beds" defaultValue={filters.beds ?? ""} inputMode="numeric" placeholder="2" />
              </label>
              <label className="browse-field">
                <span>Baths (min)</span>
                <input name="baths" defaultValue={filters.baths ?? ""} inputMode="numeric" placeholder="1" />
              </label>
            </div>
            <label className="browse-field">
              <span>Property type</span>
              <select name="type" defaultValue={filters.type}>
                <option value="">Any type</option>
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabel(type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="browse-check">
              <input type="checkbox" name="furnished" value="on" defaultChecked={filters.furnished} />
              <span>Furnished only</span>
            </label>
            <div className="browse-filter-actions">
              <button className="erp-btn" type="submit">
                Apply filters
              </button>
              <Link className="erp-btn erp-btn-ghost" href="/search">
                Clear
              </Link>
            </div>
          </form>
        </aside>

        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults filters={filters} />
        </Suspense>
      </div>

      <div className="browse-cta section-wrap">
        <Building2 size={18} />
        <p>
          <strong>Own a home?</strong> List it on liveAir and reach thousands of renters.
        </p>
        <Link className="erp-btn" href="/register">
          List your place
        </Link>
      </div>

      <SiteFooter />
    </main>
  );
}

async function SearchResults({ filters }: { filters: ListingFilters }) {
  await connection();
  const { rows, hasNext } = await searchListings(filters);
  const from = rows.length === 0 ? 0 : (filters.page - 1) * LISTING_PAGE_SIZE + 1;

  return (
    <section aria-label="Search results">
      {rows.length === 0 ? (
        <div className="browse-empty">
          <span className="browse-empty-icon">
            <SearchX size={24} strokeWidth={1.6} />
          </span>
          <h2>No homes match those filters</h2>
          <p>Try widening the rent range, removing the keyword, or clearing a filter or two.</p>
          <Link className="erp-btn erp-btn-ghost" href="/search">
            Clear all filters
          </Link>
        </div>
      ) : (
        <>
          <p className="browse-count">
            Showing {from}–{from + rows.length - 1} of homes for rent in Bangladesh.
          </p>
          <div className="browse-grid">
            {rows.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <nav className="browse-pager" aria-label="Search pages">
            {filters.page > 1 ? (
              <Link className="erp-btn erp-btn-ghost" href={toHref(filters, { page: filters.page - 1 })}>
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="browse-page-note">Page {filters.page}</span>
            {hasNext ? (
              <Link className="erp-btn erp-btn-ghost" href={toHref(filters, { page: filters.page + 1 })}>
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </>
      )}
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <section aria-label="Loading results" aria-busy="true">
      <div className="browse-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="browse-skeleton-card" key={index}>
            <span className="browse-skeleton-photo" />
            <span className="browse-skeleton-line browse-skeleton-line-title" />
            <span className="browse-skeleton-line" />
            <span className="browse-skeleton-line browse-skeleton-line-short" />
          </div>
        ))}
      </div>
    </section>
  );
}

