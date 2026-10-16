"use server";

import { redirect } from "next/navigation";
import type { Char } from "@prisma/orm-postgres/target/codec-types";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/prisma/db";
import type { FormState } from "../form-state";

const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "ROOM", "VILLA", "OTHER"] as const;
const STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"] as const;

type PropertyType = (typeof PROPERTY_TYPES)[number];
type ListingStatus = (typeof STATUSES)[number];

type ListingData = {
  title: string;
  description: string;
  city: string;
  area: string;
  addressNote: string | null;
  sizeSqft: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: PropertyType;
  furnished: boolean;
  amenities: string[];
  monthlyRent: number;
  advanceAmount: number | null;
  serviceChargeNote: string | null;
  houseRules: string | null;
  status: ListingStatus;
  photoUrls: string[];
};

function parseIntField(raw: FormDataEntryValue | null, label: string, min: number, max: number): number {
  const value = Number(String(raw ?? "").trim());
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be a whole number between ${min.toLocaleString()} and ${max.toLocaleString()}.`);
  }
  return value;
}

function parseOptionalIntField(raw: FormDataEntryValue | null, label: string, min: number, max: number): number | null {
  const text = String(raw ?? "").trim();
  if (!text) return null;
  return parseIntField(text, label, min, max);
}

function parsePhotoUrls(raw: FormDataEntryValue | null): string[] {
  const urls = String(raw ?? "")
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (urls.length > 10) {
    throw new Error("Use at most 10 photo URLs.");
  }
  for (const url of urls) {
    if (url.length > 500 || !/^https?:\/\//i.test(url)) {
      throw new Error("Each photo must be a valid http(s) URL.");
    }
  }
  return [...new Set(urls)];
}

function parseListingForm(formData: FormData, allowStatuses: readonly ListingStatus[]): ListingData {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const addressNoteRaw = String(formData.get("addressNote") ?? "").trim();
  const propertyTypeRaw = String(formData.get("propertyType") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim() || "DRAFT";
  const serviceChargeRaw = String(formData.get("serviceChargeNote") ?? "").trim();
  const houseRulesRaw = String(formData.get("houseRules") ?? "").trim();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();

  if (title.length < 4 || title.length > 120) {
    throw new Error("Title must be between 4 and 120 characters.");
  }
  if (description.length < 20 || description.length > 4000) {
    throw new Error("Description must be between 20 and 4000 characters.");
  }
  if (city.length < 2 || city.length > 80) {
    throw new Error("City must be between 2 and 80 characters.");
  }
  if (area.length < 2 || area.length > 80) {
    throw new Error("Area must be between 2 and 80 characters.");
  }
  if (addressNoteRaw.length > 300) {
    throw new Error("Address note must be 300 characters or fewer.");
  }
  if (!PROPERTY_TYPES.includes(propertyTypeRaw as PropertyType)) {
    throw new Error("Choose a valid property type.");
  }
  if (!allowStatuses.includes(statusRaw as ListingStatus)) {
    throw new Error("Choose a valid status.");
  }
  if (serviceChargeRaw.length > 300) {
    throw new Error("Service charge note must be 300 characters or fewer.");
  }
  if (houseRulesRaw.length > 2000) {
    throw new Error("House rules must be 2000 characters or fewer.");
  }

  const amenities = amenitiesRaw
    ? [...new Set(amenitiesRaw.split(/[\n,]+/).map((part) => part.trim()).filter(Boolean))]
    : [];
  if (amenities.length > 20) {
    throw new Error("Use at most 20 amenities.");
  }
  for (const amenity of amenities) {
    if (amenity.length > 40) {
      throw new Error("Each amenity must be 40 characters or fewer.");
    }
  }

  const sizeSqft = parseIntField(formData.get("sizeSqft"), "Size", 100, 100000);
  const bedrooms = parseIntField(formData.get("bedrooms"), "Bedrooms", 0, 20);
  const bathrooms = parseIntField(formData.get("bathrooms"), "Bathrooms", 0, 20);
  const monthlyRent = parseIntField(formData.get("monthlyRent"), "Monthly rent", 500, 10000000);
  const advanceAmount = parseOptionalIntField(formData.get("advanceAmount"), "Advance amount", 0, 100000000);

  return {
    title,
    description,
    city,
    area,
    addressNote: addressNoteRaw || null,
    sizeSqft,
    bedrooms,
    bathrooms,
    propertyType: propertyTypeRaw as PropertyType,
    furnished: formData.get("furnished") === "on",
    amenities,
    monthlyRent,
    advanceAmount,
    serviceChargeNote: serviceChargeRaw || null,
    houseRules: houseRulesRaw || null,
    status: statusRaw as ListingStatus,
    photoUrls: parsePhotoUrls(formData.get("photoUrls")),
  };
}

async function syncPhotos(listingId: Char<36>, urls: string[]) {
  await db.orm.mytour.ListingPhoto.where({ listingId }).deleteAll();
  for (const [index, url] of urls.entries()) {
    await db.orm.mytour.ListingPhoto.create({ listingId, url, sortOrder: index });
  }
}

export async function createListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (me.role !== "OWNER") {
    return { status: "error", message: "Only host accounts can create listings." };
  }

  let data: ListingData;
  try {
    data = parseListingForm(formData, ["DRAFT", "PUBLISHED"]);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Invalid listing details." };
  }

  const { photoUrls, ...fields } = data;
  // Availability windows are derived from the booking schedule, never entered by hand.
  const listing = await db.orm.mytour.Listing.create({ ...fields, ownerId: me.id, availableFrom: null, availableTo: null });
  await syncPhotos(listing.id, photoUrls);

  redirect("/profile/hosting");
}

export async function updateListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (me.role !== "OWNER") {
    return { status: "error", message: "Only host accounts can edit listings." };
  }

  const listingId = String(formData.get("id") ?? "").trim() as Char<36>;
  if (!listingId) {
    return { status: "error", message: "Listing not found." };
  }

  const existing = await db.orm.mytour.Listing.where({ id: listingId }).first();
  if (!existing || existing.ownerId !== me.id) {
    return { status: "error", message: "Listing not found." };
  }

  let data: ListingData;
  try {
    data = parseListingForm(formData, STATUSES);
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Invalid listing details." };
  }

  const { photoUrls, ...fields } = data;
  await db.orm.mytour.Listing.where({ id: listingId }).update(fields);
  await syncPhotos(listingId, photoUrls);

  redirect("/profile/hosting");
}

export async function deleteListing(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();
  if (me.role !== "OWNER") {
    return { status: "error", message: "Only host accounts can delete listings." };
  }

  const listingId = String(formData.get("id") ?? "").trim() as Char<36>;
  if (!listingId) {
    return { status: "error", message: "Listing not found." };
  }

  const existing = await db.orm.mytour.Listing.where({ id: listingId }).first();
  if (!existing || existing.ownerId !== me.id) {
    return { status: "error", message: "Listing not found." };
  }

  const bookings = await db.orm.mytour.Booking.where({ listingId }).all();
  const active = bookings.some((booking) => booking.status === "PENDING" || booking.status === "APPROVED");
  if (active) {
    return {
      status: "error",
      message: "This listing has pending or approved bookings and cannot be deleted. Unpublish it instead.",
    };
  }

  try {
    await db.orm.mytour.ListingPhoto.where({ listingId }).deleteAll();
    await db.orm.mytour.Listing.where({ id: listingId }).delete();
  } catch {
    return {
      status: "error",
      message: "This listing has booking history and cannot be deleted. Unpublish it instead.",
    };
  }

  redirect("/profile/hosting");
}
