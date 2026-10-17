import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/prisma/db";
import type { Char } from "@prisma/orm-postgres/target/codec-types";
import { updateListing } from "@/app/profile/hosting/actions";
import { ListingForm, type ListingDefaults } from "@/app/profile/hosting/listing-form";
import { DeleteListingForm } from "@/app/profile/hosting/delete-listing-form";

export const instant = false;

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProfileRequestBoundary>
      <EditListingContent params={params} />
    </ProfileRequestBoundary>
  );
}

async function EditListingContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (user.role !== "OWNER") {
    notFound();
  }

  const listing = await db.orm.liveBnb.Listing.where({ id: id as Char<36> })
    .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()))
    .first();

  if (!listing || listing.ownerId !== user.id) {
    notFound();
  }

  const defaults: ListingDefaults = {
    title: listing.title,
    description: listing.description,
    city: listing.city,
    area: listing.area,
    addressNote: listing.addressNote ?? "",
    sizeSqft: String(listing.sizeSqft),
    bedrooms: String(listing.bedrooms),
    bathrooms: String(listing.bathrooms),
    propertyType: listing.propertyType,
    furnished: listing.furnished,
    amenities: listing.amenities.join(", "),
    monthlyRent: String(listing.monthlyRent),
    advanceAmount: listing.advanceAmount == null ? "" : String(listing.advanceAmount),
    serviceChargeNote: listing.serviceChargeNote ?? "",
    houseRules: listing.houseRules ?? "",
    status: listing.status,
    photoUrls: listing.photos.map((photo) => photo.url).join("\n"),
  };

  return (
    <>
      <ProfilePageHeader
        eyebrow="Hosting"
        title="Edit listing"
        description={`Update "${listing.title}" — changes go live immediately for published homes.`}
      />
      <section className="erp-card">
        <ListingForm
          action={updateListing}
          defaults={defaults}
          listingId={listing.id}
          submitLabel="Save changes"
          statusOptions={["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]}
        />
      </section>

      <section className="erp-card erp-card-danger">
        <div className="erp-card-head">
          <span className="erp-card-title">
            <Trash2 size={16} /> Danger zone
          </span>
        </div>
        <p className="erp-muted">
          Deleting removes this listing permanently. Listings with pending or approved bookings cannot be
          deleted — unpublish them instead.
        </p>
        <DeleteListingForm listingId={listing.id} title={listing.title} />
      </section>
    </>
  );
}
