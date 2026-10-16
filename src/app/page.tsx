import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Calculator,
  CalendarDays,
  House,
  LayoutGrid,
  MapPin,
  Search,
  SearchX,
  ShieldCheck,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { Suspense } from "react";
import { connection } from "next/server";
import { HeaderAuth } from "@/components/header-auth";
import { emptyFilters, searchListings } from "@/lib/listings";

const categories = [
  { name: "All stays", href: "/search", icon: LayoutGrid },
  { name: "Apartments", href: "/search?type=APARTMENT", icon: Building2 },
  { name: "Houses", href: "/search?type=HOUSE", icon: House },
  { name: "Rooms", href: "/search?type=ROOM", icon: BedDouble },
  { name: "Villas", href: "/search?type=VILLA", icon: Warehouse },
];

async function FeaturedStays() {
  await connection();
  const { rows } = await searchListings({ ...emptyFilters, sort: "newest", page: 1 });
  const featured = rows.slice(0, 4);

  if (featured.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-xl border border-dashed border-[#d8d5c9] bg-[#fffefa] px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-[#cce4dc] text-[#12aeb0]">
          <SearchX size={24} strokeWidth={1.6} />
        </span>
        <h3 className="font-[Georgia,'Times_New_Roman',serif] text-[22px] text-[#153b3c]">
          Fresh homes are on their way
        </h3>
        <p className="max-w-[380px] text-[13px] leading-relaxed text-[#7a8a82]">
          No published stays yet. Browse every listing or be the first to list your place.
        </p>
        <a
          href="/search"
          className="mt-1 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#f07845] px-5 text-[13px] font-semibold text-[#fffefa] transition hover:bg-[#dc6031]"
        >
          Browse all stays <ArrowUpRight size={15} />
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
      {featured.map((listing) => {
        const cover = listing.photos[0]?.url ?? null;
        return (
          <article
            key={listing.id}
            className="group overflow-hidden rounded-xl border border-[#e7e2d4] bg-[#fffefa] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgb(21_59_60/10%)]"
          >
            <a
              href={`/property/${listing.id}`}
              aria-label={`View ${listing.title}`}
              className="relative block aspect-[4/3] bg-[#edf3ee]"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-[#9db8ae]">
                  <House size={26} strokeWidth={1.5} />
                </span>
              )}
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[rgb(21_59_60/82%)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#fffefa]">
                {listing.propertyType.charAt(0) + listing.propertyType.slice(1).toLowerCase()}
              </span>
            </a>
            <div className="grid gap-1.5 p-4">
              <a
                href={`/property/${listing.id}`}
                className="line-clamp-2 text-[15px] font-bold leading-snug text-[#153b3c] hover:text-[#dc6031]"
              >
                {listing.title}
              </a>
              <p className="flex items-center gap-1.5 text-[12.5px] text-[#7a8a82]">
                <MapPin size={13} className="shrink-0 text-[#12aeb0]" />
                {listing.area}, {listing.city}
              </p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#53635c]">
                <span className="inline-flex items-center gap-1">
                  <BedDouble size={13} className="text-[#12aeb0]" />
                  {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bath size={13} className="text-[#12aeb0]" />
                  {listing.bathrooms} {listing.bathrooms === 1 ? "Bath" : "Baths"}
                </span>
                <span>{listing.sizeSqft.toLocaleString()} sqft</span>
              </p>
              <p className="mt-0.5 text-[17px] font-bold text-[#153b3c]">
                ৳{listing.monthlyRent.toLocaleString()}
                <span className="text-[12px] font-normal text-[#7a8a82]">/month</span>
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function FeaturedStaysSkeleton() {
  return (
    <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading stays">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-[#e7e2d4] bg-[#fffefa]">
          <div className="aspect-[4/3] animate-pulse bg-[#edf0e8]" />
          <div className="grid gap-2.5 p-4">
            <div className="h-4 animate-pulse rounded bg-[#edf0e8]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[#edf0e8]" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-[#edf0e8]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  return (
    <main> 
      <header className="site-header">
        <a className="brand" href="#top" aria-label="liveAir home">
          <span className="brand-mark"><House size={20} strokeWidth={2.1} /></span>
          <span>live<span>Air</span></span>
        </a>
          <Suspense fallback={(
            <>
              <nav className="main-nav" aria-label="Main navigation">
                <a className="nav-find" href="/search">Find a stay</a>
                <a className="nav-estimator" href="/estimate" aria-label="Rent estimator">
                  <Calculator size={14} />
                  <span>Estimator</span>
                </a>
              </nav>
              <a className="header-login" href="/login">Log in</a>
            </>
          )}>
          <HeaderAuth />
        </Suspense>
      </header>

      <section className="hero mt-3" id="top" aria-labelledby="hero-title">
        <div className="hero-photo" role="img" aria-label="A modern hillside home with a pool and mountain views" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><span /> STAYS WITH A LITTLE MORE SOUL</span>
          <h1 id="hero-title">Find a place<br />to feel <em>at home.</em></h1>
          <p>One-of-a-kind homes, hosted by people who care.<br className="desktop-break" /> Make room for somewhere new.</p>
          <a className="hero-link" href="#homes">Explore stays <ArrowRight size={16} /></a>
        </div>
        <div className="photo-caption"><span>HANDPICKED STAYS</span><span>Made for living a little</span></div>
        <div className="hero-stamp" aria-hidden="true"><span>STAY AWHILE</span><House size={25} strokeWidth={1.5} /><span>FEEL AT HOME</span></div>
      </section>

      <section className="search-section" aria-label="Search for a place to stay">
        <form className="stay-search" action="#homes" method="get">
          <label className="search-field location-field">
            <MapPin size={18} />
            <span><span className="field-label">WHERE</span><input aria-label="Destination" name="destination" placeholder="Search destinations" /></span>
          </label>
          <label className="search-field date-field">
            <CalendarDays size={18} />
            <span><span className="field-label">CHECK IN</span><input aria-label="Check-in date" name="checkin" type="date" /></span>
          </label>
          <label className="search-field date-field">
            <CalendarDays size={18} />
            <span><span className="field-label">CHECK OUT</span><input aria-label="Check-out date" name="checkout" type="date" /></span>
          </label>
          <label className="search-field guest-field">
            <UsersRound size={18} />
            <span><span className="field-label">WHO&apos;S COMING</span><select aria-label="Number of guests" name="guests" defaultValue="2"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option><option value="5">5+ guests</option></select></span>
          </label>
          <button className="search-button" type="submit" aria-label="Search stays"><Search size={19} /><span>Search stays</span></button>
        </form>
      </section>

      <section className="mx-auto w-[min(1100px,calc(100%-80px))] py-11" id="homes">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#77918a]">
              A FEW VERY GOOD PLACES
            </span>
            <h2 className="mt-2 font-[Georgia,'Times_New_Roman',serif] text-[clamp(28px,3.4vw,40px)] font-normal leading-tight text-[#153b3c]">
              Stay somewhere <em className="text-[#12aeb0]">special.</em>
            </h2>
          </div>
          <a
            href="/search"
            className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#53635c] transition hover:text-[#f07845]"
          >
            Browse all stays <ArrowUpRight size={16} />
          </a>
        </div>
        <nav
          aria-label="Stay categories"
          className="scrollbar-none mb-5 flex items-center gap-7 overflow-x-auto border-b border-[#e7e5dc]"
        >
          {categories.map(({ name, href, icon: Icon }) => (
            <a
              key={name}
              href={href}
              className="flex min-h-[52px] shrink-0 items-center gap-2 text-[12px] font-semibold text-[#77827b] transition hover:text-[#153b3c]"
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{name}</span>
            </a>
          ))}
          <a
            href="/search"
            className="ml-auto mb-2 shrink-0 rounded border border-[#d9ded7] px-3 py-2 text-[11px] font-semibold text-[#345451] transition hover:border-[#12aeb0]"
          >
            Filters
          </a>
        </nav>
        <Suspense fallback={<FeaturedStaysSkeleton />}>
          <FeaturedStays />
        </Suspense>
      </section>

      <section className="promise" id="why-liveair">
        <span className="promise-mark"><ShieldCheck size={22} /></span>
        <p>Good homes. Good hosts.<br /><em>Stay like you belong.</em></p>
        <span className="promise-note">A MORE HUMAN WAY TO GET AWAY <ArrowRight size={14} /></span>
      </section>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><House size={19} /></span><span>live<span>Air</span></span></a>
        <span>Find your place. Feel at home.</span>
        <a href="#top" className="back-top">Back to top <ArrowUpRight size={14} /></a>
      </footer>
    </main>
  );
}