import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  House,
  MapPin,
  Mountain,
  Search,
  ShieldCheck,
  Star,
  Trees,
  UsersRound,
  Waves,
} from "lucide-react";
import { Suspense } from "react";
import { HeaderAuth } from "@/components/header-auth";

const stays = [
  {
    name: "The Aegean Hideaway",
    place: "Paros, Greece",
    detail: "Sea view · 2 beds",
    price: "$248",
    rating: "4.98",
    photo: "stay-aegean",
    badge: "Guest favorite",
  },
  {
    name: "A little house in the hills",
    place: "Tuscany, Italy",
    detail: "Countryside · 3 beds",
    price: "$196",
    rating: "4.95",
    photo: "stay-tuscany",
    badge: "Rare find",
  },
  {
    name: "Cabin, meet quiet",
    place: "Catskills, New York",
    detail: "Mountain view · 2 beds",
    price: "$174",
    rating: "4.99",
    photo: "stay-catskills",
    badge: "Guest favorite",
  },
  {
    name: "The slow morning house",
    place: "Ubud, Bali",
    detail: "Garden view · 1 bed",
    price: "$132",
    rating: "4.92",
    photo: "stay-bali",
    badge: "Loved by guests",
  },
];

const categories = [
  { name: "All stays", icon: House, active: true },
  { name: "Beachfront", icon: Waves },
  { name: "Cabins", icon: Trees },
  { name: "Design", icon: Building2 },
  { name: "Mountain", icon: Mountain },
];

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

      <section className="homes section-wrap" id="homes">
        <div className="section-heading">
          <div><span className="eyebrow">A FEW VERY GOOD PLACES</span><h2>Stay somewhere <em>special.</em></h2></div>
          <a className="text-link" href="/search">Browse all stays <ArrowUpRight size={16} /></a>
        </div>
        <nav className="category-nav" aria-label="Stay categories">
          {categories.map(({ name, icon: Icon, active }) => (
            <a className={active ? "category-link category-active" : "category-link"} href="#homes" key={name}>
              <Icon size={18} strokeWidth={1.7} /><span>{name}</span>
            </a>
          ))}
          <a className="filter-link" href="#homes">Filters</a>
        </nav>
        <div className="stay-grid">
          {stays.map((stay) => (
            <article className="stay-card" key={stay.name}>
              <a className={`stay-photo ${stay.photo}`} href="#why-liveair" aria-label={`View ${stay.name}`}>
                <span className="stay-badge">{stay.badge}</span>
                <span className="stay-photo-arrow"><ArrowUpRight size={16} /></span>
              </a>
              <div className="stay-info">
                <div className="stay-title-row"><h3>{stay.name}</h3><span className="stay-rating"><Star size={13} fill="currentColor" />{stay.rating}</span></div>
                <p className="stay-place">{stay.place}</p>
                <p className="stay-detail">{stay.detail}</p>
                <p className="stay-price"><strong>{stay.price}</strong> night</p>
              </div>
            </article>
          ))}
        </div>
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