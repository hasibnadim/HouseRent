import { getServerSession } from "next-auth";
import Link from "next/link";
import { Search } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { initialsFor } from "@/lib/user";

export async function HeaderAuth() {
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
