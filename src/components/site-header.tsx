import Link from "next/link";
import { ArrowUpRight, House, Search } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initialsFor } from "@/lib/user";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name?.trim() || "Account";
  const initials = session ? initialsFor(session.user.name ?? null, session.user.email ?? "") : "";

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="liveAir home">
        <span className="brand-mark">
          <House size={20} strokeWidth={2.1} />
        </span>
        <span>
          live<span>Air</span>
        </span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link className="nav-find" href="/search">
          <Search size={14} />
          Find a stay
        </Link>
      </nav>
      {session ? (
        <Link className="header-profile" href="/profile" aria-label={`Open profile for ${name}`}>
          <span className="header-avatar">{initials}</span>
          <span className="header-profile-name">{name}</span>
        </Link>
      ) : (
        <Link className="header-login" href="/login">
          Log in
        </Link>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" href="/">
        <span className="brand-mark">
          <House size={19} />
        </span>
        <span>
          live<span>Air</span>
        </span>
      </Link>
      <span>Find your place. Feel at home.</span>
      <Link href="/search" className="back-top">
        Browse stays <ArrowUpRight size={14} />
      </Link>
    </footer>
  );
}
