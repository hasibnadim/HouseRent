import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, CalendarCheck, ShieldCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import type { Char } from "@prisma/orm-postgres/target/codec-types";
import { authOptions } from "@/lib/auth";
import { initialsFor } from "@/lib/user";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { db } from "@/prisma/db";

export const instant = false;

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.orm.mytour.User.where({ id: id as Char<36> }).first();
  if (!user || user.isSuspended) {
    notFound();
  }

  const [listings, bookings] = await Promise.all([
    db.orm.mytour.Listing.where({ ownerId: user.id }).select("id").all(),
    db.orm.mytour.Booking.where({ renterId: user.id }).select("id").all(),
  ]);

  const isSelf = session.user.id === String(user.id);
  const displayName = user.name?.trim() || "liveAir member";
  const memberSince = new Date(user.createdAt).getFullYear();
  const roleLabel = user.isAdmin ? "Administrator" : user.role === "OWNER" ? "Host" : "Guest";

  return (
    <main className="min-h-screen bg-[#faf8f1]">
      <SiteHeader />

      <div className="mx-auto w-[min(720px,calc(100%-40px))] pb-12 pt-8">
        <Link
          href="/profile/activity"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#53635c] hover:text-[#dc6031]"
        >
          <ArrowLeft size={15} /> Back to bookings
        </Link>

        <section className="mt-4 rounded-2xl border border-[#e7e2d4] bg-[#fffefa] p-8 text-center shadow-[0_12px_32px_rgb(21_59_60/8%)]">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={`Photo of ${displayName}`}
              className="mx-auto h-[84px] w-[84px] rounded-full object-cover"
            />
          ) : (
            <span className="mx-auto grid h-[84px] w-[84px] place-items-center rounded-full bg-gradient-to-br from-[#57c9c4] to-[#12aeb0] text-[26px] font-bold text-[#08201f]">
              {initialsFor(user.name, user.email)}
            </span>
          )}
          <h1 className="mt-4 font-[Georgia,'Times_New_Roman',serif] text-[30px] font-normal text-[#153b3c]">
            {displayName}
          </h1>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12.5px] text-[#7a8a82]">
            <BadgeCheck size={14} className="text-[#1d9e7a]" />
            {roleLabel} · member since {Number.isNaN(memberSince) ? "—" : memberSince}
          </p>

          <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#f2f8f5] px-4 py-3.5">
              <p className="flex items-center justify-center gap-1.5 text-[22px] font-bold text-[#153b3c]">
                <Building2 size={16} className="text-[#12aeb0]" />
                {listings.length}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a8a82]">
                Listings
              </p>
            </div>
            <div className="rounded-xl bg-[#f2f8f5] px-4 py-3.5">
              <p className="flex items-center justify-center gap-1.5 text-[22px] font-bold text-[#153b3c]">
                <CalendarCheck size={16} className="text-[#12aeb0]" />
                {bookings.length}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#7a8a82]">
                Trips booked
              </p>
            </div>
          </div>

          {isSelf ? (
            <Link
              href="/profile"
              className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#f07845] px-6 text-[13px] font-bold text-[#fffefa] transition hover:bg-[#dc6031]"
            >
              <ShieldCheck size={15} /> This is you — open your account
            </Link>
          ) : (
            <p className="mx-auto mt-6 max-w-[420px] text-[12px] leading-relaxed text-[#7a8a82]">
              Contact details are only shared inside an active booking. Never pay outside
              liveAir.
            </p>
          )}
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
