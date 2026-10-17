import type { Char } from "@prisma/orm-postgres/target/codec-types";
import { or } from "@prisma/orm-postgres/orm-client";
import { db } from "@/prisma/db";

export const LISTING_PAGE_SIZE = 12;

export type ListingFilters = {
  q: string;
  city: string;
  area: string;
  minRent: number | null;
  maxRent: number | null;
  beds: number | null;
  baths: number | null;
  type: string;
  furnished: boolean;
  sort: "newest" | "rent-asc" | "rent-desc";
  page: number;
};

export const emptyFilters: ListingFilters = {
  q: "",
  city: "",
  area: "",
  minRent: null,
  maxRent: null,
  beds: null,
  baths: null,
  type: "",
  furnished: false,
  sort: "newest",
  page: 1,
};

function likePattern(value: string): string {
  const escaped = value.replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}

export async function searchListings(filters: ListingFilters) {
  const base = () => {
    let listings = db.orm.liveBnb.Listing.where((listing) => listing.status.eq("PUBLISHED"));

    if (filters.q) {
      const pattern = likePattern(filters.q);
      listings = listings.where((listing) =>
        or(
          listing.title.ilike(pattern),
          listing.description.ilike(pattern),
          listing.area.ilike(pattern),
          listing.city.ilike(pattern),
        ),
      );
    }
    if (filters.city) {
      const pattern = likePattern(filters.city);
      listings = listings.where((listing) => listing.city.ilike(pattern));
    }
    if (filters.area) {
      const pattern = likePattern(filters.area);
      listings = listings.where((listing) => listing.area.ilike(pattern));
    }
    if (filters.minRent != null) {
      listings = listings.where((listing) => listing.monthlyRent.gte(filters.minRent as number));
    }
    if (filters.maxRent != null) {
      listings = listings.where((listing) => listing.monthlyRent.lte(filters.maxRent as number));
    }
    if (filters.beds != null) {
      listings = listings.where((listing) => listing.bedrooms.gte(filters.beds as number));
    }
    if (filters.baths != null) {
      listings = listings.where((listing) => listing.bathrooms.gte(filters.baths as number));
    }
    if (filters.type) {
      const type = filters.type;
      listings = listings.where((listing) =>
        listing.propertyType.eq(type as "APARTMENT" | "HOUSE" | "ROOM" | "VILLA" | "OTHER"),
      );
    }
    if (filters.furnished) {
      listings = listings.where((listing) => listing.furnished.eq(true));
    }
    return listings;
  };

  let listings = base();
  if (filters.sort === "rent-asc") {
    listings = listings.orderBy((listing) => listing.monthlyRent.asc());
  } else if (filters.sort === "rent-desc") {
    listings = listings.orderBy((listing) => listing.monthlyRent.desc());
  } else {
    listings = listings.orderBy((listing) => listing.createdAt.desc());
  }
  const { total } = await listings.aggregate((a) => ({ total: a.count() }));


  const offset = (filters.page - 1) * LISTING_PAGE_SIZE;
  const rows = await listings
    .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()).limit(1))
    .limit(LISTING_PAGE_SIZE + 1)
    .offset(offset)
    .all();
  return {
    rows: rows.slice(0, LISTING_PAGE_SIZE),
    hasNext: rows.length > LISTING_PAGE_SIZE,
    totalPages: total ? Math.ceil(total / LISTING_PAGE_SIZE) : 1,
  };
}

export type SearchListing = Awaited<ReturnType<typeof searchListings>>["rows"][number];

export async function getPublishedListing(id: string) {
  const listing = await db.orm.liveBnb.Listing.where({ id: id as Char<36> })
    .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()))
    .first();

  if (!listing || listing.status !== "PUBLISHED") {
    return null;
  }

  const owner = await db.orm.liveBnb.User.where({ id: listing.ownerId }).first();

  const activeBookings = await db.orm.liveBnb.Booking
    .where({ listingId: listing.id })
    .where((b) => b.status.in(["PENDING", "APPROVED"]))
    .all();
  const bookedRanges = activeBookings
    .map((booking) => ({
      checkIn: booking.checkIn.slice(0, 10),
      checkOut: booking.checkOut.slice(0, 10),
    }))
    .sort((a, b) => (a.checkIn < b.checkIn ? -1 : 1));

  const similar = await db.orm.liveBnb.Listing.where((row) => row.status.eq("PUBLISHED"))
    .where((row) => row.city.eq(listing.city))
    .where((row) => row.id.neq(listing.id))
    .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()).limit(1))
    .orderBy((row) => row.createdAt.desc())
    .limit(4)
    .all();

  return {
    listing,
    photos: listing.photos,
    ownerName: owner?.name?.trim() || "Verified host",
    ownerImage: owner?.image?.trim() || null,
    ownerPhone: owner?.phone ?? null,
    ownerSince: owner?.createdAt ?? null,
    bookedRanges,
    similar: similar.filter((row) => row.id !== listing.id),
  };
}

export type PublishedListing = Awaited<ReturnType<typeof getPublishedListing>>;
