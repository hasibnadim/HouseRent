import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  IdCard,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { initialsFor } from "@/lib/user";

export const instant = false;

function formatMemberSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

export default function ProfileOverviewPage() {
  return (
    <ProfileRequestBoundary>
      <ProfileOverviewContent />
    </ProfileRequestBoundary>
  );
}

async function ProfileOverviewContent() {
  const user = await getCurrentUser();
  const initials = initialsFor(user.name, user.email);
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || "there";

  const checklist = [
    { label: "Account name", done: Boolean(user.name?.trim()) },
    { label: "Contact number", done: Boolean(user.phone?.trim()) },
    { label: "Profile photo", done: Boolean(user.image?.trim()) },
  ];
  const completed = checklist.filter((item) => item.done).length;
  const completion = Math.round((completed / checklist.length) * 100);

  const roleLabel = user.isAdmin ? "Administrator" : user.role === "OWNER" ? "Host" : "Guest";

  return (
    <>
      <ProfilePageHeader
        eyebrow="Account overview"
        title={`Welcome back, ${firstName}.`}
        description="Your account at a glance — keep your details current so bookings and payouts run smoothly."
        action={
          <Link className="erp-btn erp-btn-ghost" href="/profile/personal">
            Edit profile <ArrowUpRight size={15} />
          </Link>
        }
      />

      <div className="erp-grid erp-cols-3">
        <article className="erp-card">
          <span className="erp-stat">
            <span className="erp-stat-label">Account type</span>
            <span className="erp-stat-value">{roleLabel}</span>
            <span className="erp-stat-note">{user.isAdmin ? "Full platform access" : user.role === "OWNER" ? "You can list properties" : "Browse and book stays"}</span>
          </span>
        </article>
        <article className="erp-card">
          <span className="erp-stat">
            <span className="erp-stat-label">Profile complete</span>
            <span className="erp-stat-value">{completion}%</span>
            <span className="erp-stat-note">{completed} of {checklist.length} details added</span>
          </span>
        </article>
        <article className="erp-card">
          <span className="erp-stat">
            <span className="erp-stat-label">Member since</span>
            <span className="erp-stat-value erp-stat-date">{formatMemberSince(user.createdAt)}</span>
            <span className="erp-stat-note">Email: {user.email}</span>
          </span>
        </article>
      </div>

      <div className="erp-grid erp-cols-2 erp-grid-spaced">
        <section className="erp-card">
          <div className="erp-card-head">
            <span className="erp-card-title"><IdCard size={16} /> Account details</span>
            <span className="erp-badge">{roleLabel}</span>
          </div>
          <div className="erp-profile-row">
            <span className="erp-avatar erp-avatar-lg">{initials}</span>
            <div>
              <strong className="erp-profile-name">{user.name ?? "Add your name"}</strong>
              <span className="erp-muted">{user.email}</span>
            </div>
          </div>
          <dl className="erp-def">
            <dt>Full name</dt>
            <dd>{user.name?.trim() || <span className="erp-muted">Not set</span>}</dd>
            <dt>Phone</dt>
            <dd>{user.phone?.trim() || <span className="erp-muted">Not set</span>}</dd>
            <dt>Role</dt>
            <dd>{user.role === "OWNER" ? "Owner / host" : "Renter / guest"}</dd>
          </dl>
        </section>

        <section className="erp-card">
          <div className="erp-card-head">
            <span className="erp-card-title"><Sparkles size={16} /> Finish setting up</span>
            <span className="erp-muted">{completed}/{checklist.length} done</span>
          </div>
          <ul className="erp-checklist">
            {checklist.map((item) => (
              <li className={item.done ? "erp-check erp-check-done" : "erp-check"} key={item.label}>
                <span className="erp-check-mark"><CheckMark done={item.done} /></span>
                <span>{item.label}</span>
                {!item.done && <span className="erp-badge erp-badge-muted">To do</span>}
              </li>
            ))}
          </ul>
          <div className="erp-quick">
            <Link className="erp-quick-link" href="/profile/personal">
              <IdCard size={16} /> Personal information <ArrowUpRight size={14} />
            </Link>
            <Link className="erp-quick-link" href="/profile/security">
              <KeyRound size={16} /> Security <ArrowUpRight size={14} />
            </Link>
            <Link className="erp-quick-link" href="/profile/activity">
              <CalendarCheck size={16} /> Bookings <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="erp-trust"><ShieldCheck size={14} /> Your details are private and only used to secure your account.</p>
        </section>
      </div>
    </>
  );
}

function CheckMark({ done }: { done: boolean }) {
  return done ? <ShieldCheck size={13} /> : <span className="erp-check-dot" />;
}
