import { getServerSession } from "next-auth";
import Link from "next/link";
import { Calculator, Search } from "lucide-react";
import { connection } from "next/server";
import { authOptions } from "@/lib/auth";
import { initialsFor } from "@/lib/user";

export async function HeaderAuth() {
  // Session Cookies/JWT touch crypto randomness: keep this out of prerender.
  await connection();
  const session = await getServerSession(authOptions);
  const name = session?.user?.name?.trim() || "Account";
  const initials = session ? initialsFor(session.user.name ?? null, session.user.email ?? "") : "";

  return (
    <>
      <nav className="main-nav" aria-label="Main navigation">
        <Link className="nav-find" href="/search">
          <Search size={14} />
          Find a stay
        </Link>
        <Link className="nav-estimator" href="/estimate" aria-label="Rent estimator">
          <Calculator size={14} />
          <span>AI Estimator</span>
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
    </>
  );
}
