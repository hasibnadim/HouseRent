"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarDays, CalendarX2 } from "lucide-react";
import { createBooking } from "@/app/bookings/actions";
import { initialFormState } from "@/app/profile/form-state";

export type BookedRange = {
  checkIn: string;
  checkOut: string;
};

function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDay(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function BookingForm({
  listingId,
  monthlyRent,
  advanceAmount,
  bookedRanges,
}: {
  listingId: string;
  monthlyRent: number;
  advanceAmount: number | null;
  bookedRanges: BookedRange[];
}) {
  const [state, formAction, pending] = useActionState(createBooking, initialFormState);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const today = useMemo(todayLocal, []);

  const nights = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return 0;
    const diff = Math.round(
      (new Date(`${checkOut}T00:00:00Z`).getTime() - new Date(`${checkIn}T00:00:00Z`).getTime()) / 86_400_000,
    );
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  const clashes = useMemo(() => {
    if (nights < 1) return [];
    return bookedRanges.filter((range) => checkIn < range.checkOut && range.checkIn < checkOut);
  }, [nights, checkIn, checkOut, bookedRanges]);

  const previewTotal = nights > 0 && clashes.length === 0 ? Math.max(1, Math.round((nights * monthlyRent) / 30)) : 0;

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="listingId" value={listingId} />
      <label className="browse-field">
        <span>Check-in</span>
        <input
          type="date"
          name="checkIn"
          required
          min={today}
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </label>
      <label className="browse-field">
        <span>Check-out</span>
        <input
          type="date"
          name="checkOut"
          required
          min={checkIn || today}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
        />
      </label>
      <label className="browse-field">
        <span>
          Note for the host <small>optional</small>
        </span>
        <textarea name="renterNote" rows={2} maxLength={500} placeholder="Move-in time, family size…" />
      </label>

      {bookedRanges.length > 0 && (
        <p className="booking-blocked">
          <CalendarX2 size={14} />
          <span>
            Unavailable:{" "}
            {bookedRanges.map((range) => `${formatDay(range.checkIn)} → ${formatDay(range.checkOut)}`).join(" · ")}
          </span>
        </p>
      )}

      {clashes.length > 0 && (
        <p className="erp-alert erp-alert-error" role="alert">
          Those dates overlap a trip that is already booked ({clashes.map((range) => `${formatDay(range.checkIn)} → ${formatDay(range.checkOut)}`).join(", ")}).
          Please pick different dates.
        </p>
      )}

      <div className="booking-breakdown">
        <p>
          <span>
            ৳{monthlyRent.toLocaleString()} / 30 days{nights > 0 ? ` × ${nights} night${nights === 1 ? "" : "s"}` : ""}
          </span>
          <strong>{previewTotal > 0 ? `৳${previewTotal.toLocaleString()}` : "—"}</strong>
        </p>
        {(advanceAmount ?? 0) > 0 && (
          <p>
            <span>Advance payable on approval</span>
            <strong>৳{(advanceAmount ?? 0).toLocaleString()}</strong>
          </p>
        )}
        <p className="booking-total">
          <span>Total due</span>
          <strong>{previewTotal > 0 ? `৳${previewTotal.toLocaleString()}` : "—"}</strong>
        </p>
      </div>

      {state.status === "error" && (
        <p className="erp-alert erp-alert-error" role="alert">
          {state.message}
        </p>
      )}

      <button className="erp-btn" type="submit" disabled={pending || nights < 1 || clashes.length > 0}>
        <CalendarDays size={15} />
        {pending ? "Sending…" : "Request to book"}
      </button>
      <p className="property-note">Free to request — you pay nothing until the host approves.</p>
    </form>
  );
}
