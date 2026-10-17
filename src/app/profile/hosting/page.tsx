import Link from "next/link";
import { Bath, BedDouble, Building2, MapPin, PencilLine, Plus, Ruler } from "lucide-react";
import { ProfileEmptyState, ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { Pager } from "@/components/pager";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/prisma/db";

export const instant = false;

const HOSTING_PAGE_SIZE = 12;

export default function HostingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <ProfileRequestBoundary>
      <HostingContent searchParams={searchParams} />
    </ProfileRequestBoundary>
  );
}

async function HostingContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.min(Math.max(Number.parseInt(rawPage ?? "", 10) || 1, 1), 10000);

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

  const counted = await db.orm.mytour.Listing.where({ ownerId: user.id }).select("id").all();
  const total = counted.length;
  const totalPages = Math.max(1, Math.ceil(total / HOSTING_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const fullListings = await db.orm.mytour.Listing.where({ ownerId: user.id })
    .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()).limit(1))
    .orderBy((listing) => listing.updatedAt.desc())
    .limit(HOSTING_PAGE_SIZE)
    .offset((currentPage - 1) * HOSTING_PAGE_SIZE)
    .all();
  const listings = fullListings;

  return (
    <>
      <ProfilePageHeader
        eyebrow="Hosting"
        title="My listings"
        description={`Manage the ${total.toLocaleString()} home${total === 1 ? "" : "s"} you rent out — pricing, availability and performance.`}
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
      {(listings.length > 0 || currentPage > 1) && (
        <Pager
          page={currentPage}
          totalPages={totalPages}
          hrefFor={(next) => `/profile/hosting${next > 1 ? `?page=${next}` : ""}`}
          label="Listing pages"
        />
      )}
    </>
  );
}
