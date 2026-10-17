"use server";

import { redirect } from "next/navigation";
import type { Char } from "@prisma/orm-postgres/target/codec-types";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/prisma/db";
import type { FormState } from "@/app/profile/form-state";

const DAY_MS = 86_400_000;

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / DAY_MS);
}

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function overlaps(aIn: string, aOut: string, bIn: string, bOut: string): boolean {
  return aIn < bOut && bIn < aOut;
}

async function hasOverlap(listingId: Char<36>, checkIn: string, checkOut: string, ignoreId?: string): Promise<boolean> {
  const bookings = await db.orm.liveBnb.Booking.where({ listingId }).all();
  return bookings.some(
    (booking) =>
      booking.id !== ignoreId &&
      (booking.status === "PENDING" || booking.status === "APPROVED") &&
      overlaps(checkIn, checkOut, booking.checkIn.slice(0, 10), booking.checkOut.slice(0, 10)),
  );
}

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();

  const listingId = String(formData.get("listingId") ?? "").trim() as Char<36>;
  const checkIn = String(formData.get("checkIn") ?? "").trim();
  const checkOut = String(formData.get("checkOut") ?? "").trim();
  const renterNote = String(formData.get("renterNote") ?? "").trim();

  if (!listingId) {
    return { status: "error", message: "Listing not found." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return { status: "error", message: "Choose valid check-in and check-out dates." };
  }
  if (checkIn < todayISO()) {
    return { status: "error", message: "Check-in cannot be in the past." };
  }
  if (checkOut <= checkIn) {
    return { status: "error", message: "Check-out must be after check-in." };
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1 || nights > 365) {
    return { status: "error", message: "Stays must be between 1 and 365 nights." };
  }
  if (renterNote.length > 500) {
    return { status: "error", message: "Your note must be 500 characters or fewer." };
  }

  const listing = await db.orm.liveBnb.Listing.where({ id: listingId }).first();
  if (!listing || listing.status !== "PUBLISHED") {
    return { status: "error", message: "This home is no longer available for booking." };
  }
  if (listing.ownerId === me.id) {
    return { status: "error", message: "You cannot book your own listing." };
  }

  if (await hasOverlap(listingId, checkIn, checkOut)) {
    return { status: "error", message: "Those dates overlap an existing booking. Try different dates." };
  }

  // Server is the source of truth for money: derive everything from the listing.
  const totalAmount = Math.max(1, Math.round((nights * listing.monthlyRent) / 30));

  await db.orm.liveBnb.Booking.create({
    listingId,
    renterId: me.id,
    checkIn: new Date(`${checkIn}T00:00:00Z`).toISOString(),
    checkOut: new Date(`${checkOut}T00:00:00Z`).toISOString(),
    status: "PENDING",
    monthlyRentSnapshot: listing.monthlyRent,
    serviceChargeAmount: 0,
    discountAmount: 0,
    advanceAmount: listing.advanceAmount ?? 0,
    totalAmount,
    renterNote: renterNote || null,
  });

  redirect("/profile/activity");
}

export async function cancelBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();

  const bookingId = String(formData.get("id") ?? "").trim() as Char<36>;
  const booking = await db.orm.liveBnb.Booking.where({ id: bookingId }).first();
  if (!booking || booking.renterId !== me.id) {
    return { status: "error", message: "Booking not found." };
  }
  if (booking.status !== "PENDING" && booking.status !== "APPROVED") {
    return { status: "error", message: "Only pending or approved bookings can be cancelled." };
  }
  if (booking.checkIn.slice(0, 10) <= todayISO()) {
    return { status: "error", message: "This stay has already started and cannot be cancelled." };
  }

  await db.orm.liveBnb.Booking.where({ id: bookingId }).update({
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
  });

  redirect("/profile/activity");
}

export async function respondToBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();

  const bookingId = String(formData.get("id") ?? "").trim() as Char<36>;
  const decision = String(formData.get("decision") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (decision !== "approve" && decision !== "decline") {
    return { status: "error", message: "Choose whether to approve or decline." };
  }

  const booking = await db.orm.liveBnb.Booking.where({ id: bookingId }).first();
  if (!booking) {
    return { status: "error", message: "Booking not found." };
  }
  const listing = await db.orm.liveBnb.Listing.where({ id: booking.listingId }).first();
  if (!listing || listing.ownerId !== me.id) {
    return { status: "error", message: "Only the host can respond to this request." };
  }
  if (booking.status !== "PENDING") {
    return { status: "error", message: "This request has already been answered." };
  }

  if (decision === "decline") {
    if (reason.length < 3 || reason.length > 500) {
      return { status: "error", message: "Give a short reason (3–500 characters) when declining." };
    }
    await db.orm.liveBnb.Booking.where({ id: bookingId }).update({
      status: "DECLINED",
      declineReason: reason,
      declinedAt: new Date().toISOString(),
    });
    redirect("/profile/activity");
  }

  const checkIn = booking.checkIn.slice(0, 10);
  const checkOut = booking.checkOut.slice(0, 10);
  if (checkIn <= todayISO()) {
    return { status: "error", message: "This stay has already started and cannot be approved." };
  }
  if (await hasOverlap(booking.listingId, checkIn, checkOut, booking.id)) {
    return { status: "error", message: "These dates now overlap another booking. Decline this request instead." };
  }

  await db.orm.liveBnb.Booking.where({ id: bookingId }).update({
    status: "APPROVED",
    approvedAt: new Date().toISOString(),
  });

  redirect("/profile/activity");
}
