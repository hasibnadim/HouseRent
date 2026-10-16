import Link from "next/link";
import { ArrowRight, BedDouble, Building2, CalendarCheck, Inbox, MapPin, Phone } from "lucide-react";
import { ProfileEmptyState, ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { initialsFor } from "@/lib/user";
import { db } from "@/prisma/db";
import { CancelBookingButton, RespondToBookingForm } from "./booking-actions";

export const instant = false;

export default function ActivityPage() {
  return (
    <ProfileRequestBoundary>
      <ActivityContent />
    </ProfileRequestBoundary>
  );
}

function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.max(
    0,
    Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000),
  );
}

function statusLabel(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

async function ActivityContent() {
  const me = await getCurrentUser();

  const myBookings = await db.orm.mytour.Booking.where({ renterId: me.id })
    .orderBy((booking) => booking.createdAt.desc())
    .all();

  let incoming: typeof myBookings = [];
  if (me.role === "OWNER") {
    const mine = await db.orm.mytour.Listing.where({ ownerId: me.id }).all();
    const ids = mine.map((listing) => listing.id);
    if (ids.length > 0) {
      incoming = await db.orm.mytour.Booking.where((booking) => booking.listingId.in(ids))
        .orderBy((booking) => booking.createdAt.desc())
        .all();
    }
  }

  const listingIds = [...new Set([...myBookings, ...incoming].map((booking) => booking.listingId))];
  const renterIds = [...new Set(incoming.map((booking) => booking.renterId))];

  const listings =
    listingIds.length > 0
      ? await db.orm.mytour.Listing.where((listing) => listing.id.in(listingIds))
          .include("photos", (photos) => photos.orderBy((photo) => photo.sortOrder.asc()).limit(1))
          .all()
      : [];
  const renters =
    renterIds.length > 0 ? await db.orm.mytour.User.where((user) => user.id.in(renterIds)).all() : [];

  const listingById = new Map(listings.map((listing) => [listing.id, listing]));
  const renterById = new Map(renters.map((renter) => [renter.id, renter]));
  const today = todayISO();

  const pendingIncoming = incoming.filter((booking) => booking.status === "PENDING");

  return (
    <>
      <ProfilePageHeader
        eyebrow="Activity"
        title="Bookings"
        description="Track your trips and, if you host, answer incoming booking requests."
      />

      {me.role === "OWNER" && (
        <section className="book-section">
          <h3 className="book-section-title">
            <Inbox size={15} /> Requests on your listings
            {pendingIncoming.length > 0 && <span className="erp-badge">{pendingIncoming.length} pending</span>}
          </h3>
          {incoming.length === 0 ? (
            <p className="erp-muted">No booking requests yet. They will appear here when renters book your homes.</p>
          ) : (
            <div className="erp-list">
              {incoming.map((booking) => {
                const listing = listingById.get(booking.listingId);
                const renter = renterById.get(booking.renterId);
                const renterName = renter?.name?.trim() || "Renter";
                const cover = listing?.photos[0]?.url ?? null;
                const nights = nightsBetween(booking.checkIn, booking.checkOut);
                return (
                  <article className="erp-card book-row" key={booking.id}>
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="book-cover" src={cover} alt="" loading="lazy" />
                    ) : (
                      <span className="book-cover book-cover-empty" aria-hidden="true">
                        <Building2 size={22} />
                      </span>
                    )}
                    <div className="book-main">
                      <div className="book-top">
                        <strong>{listing?.title ?? "Deleted listing"}</strong>
                        <span className={`book-status book-status-${booking.status}`}>
                          {statusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="book-person">
                        <span className="book-mini-avatar">{initialsFor(renter?.name ?? null, "")}</span>
                        {renter ? (
                          <Link className="book-person-link" href={`/users/${renter.id}`}>
                            {renterName}
                          </Link>
                        ) : (
                          renterName
                        )}
                        {renter?.phone && (
                          <a className="book-phone" href={`tel:${renter.phone.replace(/\s+/g, "")}`}>
                            <Phone size={12} /> {renter.phone}
                          </a>
                        )}
                      </p>
                      <ul className="book-facts">
                        <li>
                          <span>Check-in</span>
                          <strong>{formatDay(booking.checkIn)}</strong>
                        </li>
                        <li>
                          <span>Check-out</span>
                          <strong>{formatDay(booking.checkOut)}</strong>
                        </li>
                        <li>
                          <span>Stay</span>
                          <strong>
                            {nights} night{nights === 1 ? "" : "s"}
                          </strong>
                        </li>
                        <li>
                          <span>Total</span>
                          <strong>৳{booking.totalAmount.toLocaleString()}</strong>
                        </li>
                      </ul>
                      {booking.renterNote && <p className="book-note">“{booking.renterNote}”</p>}
                      {booking.status === "PENDING" && <RespondToBookingForm bookingId={booking.id} />}
                      {booking.status === "DECLINED" && booking.declineReason && (
                        <p className="erp-muted">Declined: {booking.declineReason}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className="book-section">
        <h3 className="book-section-title">
          <CalendarCheck size={15} /> My trips
        </h3>
        {myBookings.length === 0 ? (
          <ProfileEmptyState
            icon={CalendarCheck}
            title="No trips yet"
            description="Once you request a stay, it will show up here. Ready to plan your next trip?"
            action={
              <Link className="erp-btn" href="/search">
                Browse stays
              </Link>
            }
          />
        ) : (
          <div className="erp-list">
            {myBookings.map((booking) => {
              const listing = listingById.get(booking.listingId);
              const cover = listing?.photos[0]?.url ?? null;
              const nights = nightsBetween(booking.checkIn, booking.checkOut);
              const perDay = Math.max(1, Math.round(booking.monthlyRentSnapshot / 30));
              const cancellable =
                (booking.status === "PENDING" || booking.status === "APPROVED") &&
                booking.checkIn.slice(0, 10) > today;
              return (
                <article className="erp-card book-row" key={booking.id}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="book-cover" src={cover} alt="" loading="lazy" />
                  ) : (
                    <span className="book-cover book-cover-empty" aria-hidden="true">
                      <Building2 size={22} />
                    </span>
                  )}
                  <div className="book-main">
                    <div className="book-top">
                      <strong>
                        {listing ? (
                          <Link className="book-title-link" href={`/property/${listing.id}`}>
                            {listing.title}
                          </Link>
                        ) : (
                          "Deleted listing"
                        )}
                      </strong>
                      <span className={`book-status book-status-${booking.status}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                    {listing && (
                      <p className="book-loc">
                        <MapPin size={13} />
                        {listing.area}, {listing.city}
                        <span className="book-loc-sep">·</span>
                        <BedDouble size={13} />
                        {listing.bedrooms} {listing.bedrooms === 1 ? "Bed" : "Beds"}
                      </p>
                    )}
                    <ul className="book-facts">
                      <li>
                        <span>Check-in</span>
                        <strong>{formatDay(booking.checkIn)}</strong>
                      </li>
                      <li>
                        <span>Check-out</span>
                        <strong>{formatDay(booking.checkOut)}</strong>
                      </li>
                      <li>
                        <span>Stay</span>
                        <strong>
                          {nights} night{nights === 1 ? "" : "s"}
                        </strong>
                      </li>
                      <li>
                        <span>Rate</span>
                        <strong>৳{perDay.toLocaleString()}/day</strong>
                      </li>
                      <li>
                        <span>Total</span>
                        <strong>৳{booking.totalAmount.toLocaleString()}</strong>
                      </li>
                      {(booking.advanceAmount ?? 0) > 0 && (
                        <li>
                          <span>Advance</span>
                          <strong>৳{(booking.advanceAmount ?? 0).toLocaleString()}</strong>
                        </li>
                      )}
                    </ul>
                    <p className="book-requested">
                      Requested {formatDateTime(booking.createdAt)}
                      {booking.status === "APPROVED" && booking.approvedAt && (
                        <> · Approved {formatDateTime(booking.approvedAt)}</>
                      )}
                    </p>
                    {booking.status === "DECLINED" && booking.declineReason && (
                      <p className="erp-muted">Host&apos;s reason: {booking.declineReason}</p>
                    )}
                    {cancellable && (
                      <CancelBookingButton bookingId={booking.id} title={listing?.title ?? "this stay"} />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="book-foot">
        Looking for a home instead?
        <Link href="/search">
          Browse stays <ArrowRight size={13} />
        </Link>
      </p>
    </>
  );
}
