import Link from "next/link";
import { Bath, BedDouble, Building2, MapPin, PencilLine, Plus, Ruler } from "lucide-react";
import { ProfileEmptyState, ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/prisma/db";

export const instant = false;

export default function HostingPage() {
  return (
    <ProfileRequestBoundary>
      <HostingContent />
    </ProfileRequestBoundary>
  );
}

async function HostingContent() {
  const user = await getCurrentUser();

  if (user.role !== "OWNER") {
    return (
      <>
        <ProfilePageHeader eyebrow="Hosting" title="My listings" />
        <ProfileEmptyState
          icon={Building2}
          title="Host account required"
          description="This area is for owners who list properties on liveAir. Your account is currently set up as a guest."
        />
      </>
    );
  }

  const listings = await db.orm.mytour.Listing.where({ ownerId: user.id })
    .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()).limit(1))
    .orderBy((listing) => listing.updatedAt.desc())
    .all();

  return (
    <>
      <ProfilePageHeader
        eyebrow="Hosting"
        title="My listings"
        description="Manage the homes you rent out, their availability and their performance."
        action={
          <Link className="erp-btn" href="/profile/hosting/new">
            <Plus size={15} />
            New listing
          </Link>
        }
      />

      {listings.length === 0 ? (
        <ProfileEmptyState
          icon={Building2}
          title="No listings yet"
          description="When you create your first listing, you'll be able to manage pricing, availability and photos from here."
          action={
            <Link className="erp-btn" href="/profile/hosting/new">
              <Plus size={15} />
              Create your first listing
            </Link>
          }
        />
      ) : (
        <div className="erp-list">
          {listings.map((listing) => {
            const cover = listing.photos[0]?.url ?? null;
            return (
              <article className="erp-listing" key={listing.id}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="erp-listing-cover" src={cover} alt="" loading="lazy" />
                ) : (
                  <span className="erp-listing-cover erp-listing-cover-empty" aria-hidden="true">
                    <Building2 size={22} />
                  </span>
                )}
                <div className="erp-listing-body">
                  <div className="erp-listing-top">
                    <h3>{listing.title}</h3>
                    <span className={`erp-status erp-status-${listing.status}`}>
                      {listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <p className="erp-listing-loc">
                    <MapPin size={13} />
                    {listing.area}, {listing.city}
                  </p>
                  <ul className="erp-listing-specs">
                    <li>
                      <BedDouble size={13} />
                      {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
                    </li>
                    <li>
                      <Bath size={13} />
                      {listing.bathrooms} {listing.bathrooms === 1 ? "Bath" : "Baths"}
                    </li>
                    <li>
                      <Ruler size={13} />
                      {listing.sizeSqft.toLocaleString()} sqft
                    </li>
                    <li>{listing.propertyType.charAt(0) + listing.propertyType.slice(1).toLowerCase()}</li>
                  </ul>
                </div>
                <div className="erp-listing-side">
                  <p className="erp-listing-rent">
                    ৳{listing.monthlyRent.toLocaleString()}
                    <span>/month</span>
                  </p>
                  <Link className="erp-btn erp-btn-ghost" href={`/profile/hosting/${listing.id}/edit`}>
                    <PencilLine size={15} />
                    Edit
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
