import Link from "next/link";
import { Bath, BedDouble, House, MapPin } from "lucide-react";
import type { SearchListing } from "@/lib/listings";

export function typeLabel(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export function ListingCard({ listing }: { listing: SearchListing }) {
  const cover = listing.photos[0]?.url ?? null;
  return (
    <article className="browse-card">
      <Link
        className="browse-card-photo"
        href={`/property/${listing.id}`}
        aria-label={`View ${listing.title}`}
      >
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" loading="lazy" />
        ) : (
          <span className="browse-card-photo-empty" aria-hidden="true">
            <House size={26} strokeWidth={1.5} />
          </span>
        )}
        <span className="browse-card-type">{typeLabel(listing.propertyType)}</span>
      </Link>
      <div className="browse-card-body">
        <Link className="browse-card-title" href={`/property/${listing.id}`}>
          {listing.title}
        </Link>
        <p className="browse-card-loc">
          <MapPin size={13} />
          {listing.area}, {listing.city}
        </p>
        <p className="browse-card-specs">
          <span>
            <BedDouble size={13} /> {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
          </span>
          <span>
            <Bath size={13} /> {listing.bathrooms} {listing.bathrooms === 1 ? "Bath" : "Baths"}
          </span>
          <span>{listing.sizeSqft.toLocaleString()} sqft</span>
        </p>
        <p className="browse-card-rent">
          ৳{listing.monthlyRent.toLocaleString()}
          <span>/month</span>
        </p>
      </div>
    </article>
  );
}
