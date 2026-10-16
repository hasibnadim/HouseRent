import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  CircleCheck,
  House,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initialsFor } from "@/lib/user";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { ListingCard, typeLabel } from "@/components/listing-card";
import { getPublishedListing } from "@/lib/listings";

export const instant = false;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="property">
      <SiteHeader />

      <div className="section-wrap">
        <Link className="property-back" href="/search">
          <ArrowLeft size={15} /> Back to search
        </Link>

        <Suspense fallback={<PropertySkeleton />}>
          <PropertyContent id={id} />
        </Suspense>
      </div>

      <SiteFooter />
    </main>
  );
}

async function PropertyContent({ id }: { id: string }) {
  const [data, session] = await Promise.all([getPublishedListing(id), getServerSession(authOptions)]);

  if (!data) {
    notFound();
  }

  const { listing, photos, ownerName, ownerPhone, ownerSince, similar } = data;
  const cover = photos[0]?.url ?? null;

  return (
    <>
      <div className="property-heading">
        <div>
          <span className="eyebrow">
            {typeLabel(listing.propertyType)} FOR RENT · {listing.city.toUpperCase()}
          </span>
          <h1>{listing.title}</h1>
          <p className="property-loc">
            <MapPin size={14} />
            {listing.area}, {listing.city}
            {listing.addressNote ? ` · ${listing.addressNote}` : ""}
          </p>
        </div>
      </div>

      {cover ? (
        <div className="property-gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="property-gallery-main" src={cover} alt={listing.title} />
          <div className="property-gallery-side">
            {photos.slice(1, 5).map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={photo.id} src={photo.url} alt="" loading="lazy" />
            ))}
            {photos.length <= 1 && (
              <span className="property-gallery-note">
                <House size={18} /> More photos coming soon
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="property-gallery-empty">
          <House size={30} strokeWidth={1.4} />
          <p>No photos yet — contact the host for a viewing.</p>
        </div>
      )}

      <div className="property-layout">
        <div className="property-main">
          <ul className="property-facts">
            <li>
              <BedDouble size={17} />
              <strong>{listing.bedrooms}</strong>
              <span>{listing.bedrooms === 1 ? "Bedroom" : "Bedrooms"}</span>
            </li>
            <li>
              <Bath size={17} />
              <strong>{listing.bathrooms}</strong>
              <span>{listing.bathrooms === 1 ? "Bathroom" : "Bathrooms"}</span>
            </li>
            <li>
              <Ruler size={17} />
              <strong>{listing.sizeSqft.toLocaleString()}</strong>
              <span>Square feet</span>
            </li>
            <li>
              <House size={17} />
              <strong>{listing.furnished ? "Yes" : "No"}</strong>
              <span>Furnished</span>
            </li>
          </ul>

          <section className="property-section">
            <h2>About this home</h2>
            <p className="property-description">{listing.description}</p>
          </section>

          {listing.amenities.length > 0 && (
            <section className="property-section">
              <h2>Amenities</h2>
              <ul className="property-chips">
                {listing.amenities.map((amenity) => (
                  <li key={amenity}>
                    <CircleCheck size={13} /> {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="property-section">
            <h2>Details</h2>
            <dl className="property-def">
              <dt>Property type</dt>
              <dd>{typeLabel(listing.propertyType)}</dd>
              <dt>Available from</dt>
              <dd>{formatDate(listing.availableFrom)}</dd>
              <dt>Available to</dt>
              <dd>{listing.availableTo ? formatDate(listing.availableTo) : "Open-ended"}</dd>
              <dt>Advance / deposit</dt>
              <dd>
                {listing.advanceAmount == null
                  ? "Contact host"
                  : `৳${listing.advanceAmount.toLocaleString()}`}
              </dd>
              <dt>Service charge</dt>
              <dd>{listing.serviceChargeNote ?? "Contact host"}</dd>
            </dl>
          </section>

          {listing.houseRules && (
            <section className="property-section">
              <h2>House rules</h2>
              <p className="property-description">{listing.houseRules}</p>
            </section>
          )}

          <section className="property-host">
            <span className="property-host-avatar">{initialsFor(ownerName, "")}</span>
            <div>
              <strong>Hosted by {ownerName}</strong>
              <span>
                <ShieldCheck size={13} /> Verified host
                {ownerSince ? ` · hosting since ${new Date(ownerSince).getFullYear()}` : ""}
              </span>
            </div>
          </section>
        </div>

        <aside className="property-side">
          <div className="property-price-card">
            <p className="property-price">
              ৳{listing.monthlyRent.toLocaleString()}
              <span>/month</span>
            </p>
            <p className="property-available">
              <CalendarDays size={14} />
              Available from {formatDate(listing.availableFrom)}
            </p>
            {session ? (
              <>
                <button className="erp-btn" type="button" disabled title="Booking requests open soon">
                  Request to book
                </button>
                <p className="property-note">
                  Online booking requests open soon. Meanwhile you can reach the host directly:
                </p>
                {ownerPhone ? (
                  <a className="property-phone" href={`tel:${ownerPhone.replace(/\s+/g, "")}`}>
                    <Phone size={15} /> {ownerPhone}
                  </a>
                ) : (
                  <p className="property-note">The host hasn&apos;t shared a phone number yet.</p>
                )}
              </>
            ) : (
              <>
                <Link className="erp-btn" href={`/login?callbackUrl=/property/${listing.id}`}>
                  Log in to request
                </Link>
                <p className="property-note">
                  Booking requests need an account — it takes a minute to join.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="property-similar">
          <h2>Similar homes in {listing.city}</h2>
          <div className="browse-grid">
            {similar.map((row) => (
              <ListingCard key={row.id} listing={row} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function PropertySkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading home details">
      <span className="browse-skeleton-line browse-skeleton-line-title" />
      <div className="property-gallery">
        <span className="browse-skeleton-photo property-gallery-main" />
        <div className="property-gallery-side">
          <span className="browse-skeleton-photo" />
          <span className="browse-skeleton-photo" />
          <span className="browse-skeleton-photo" />
          <span className="browse-skeleton-photo" />
        </div>
      </div>
      <span className="browse-skeleton-line" />
      <span className="browse-skeleton-line" />
      <span className="browse-skeleton-line browse-skeleton-line-short" />
    </div>
  );
}
