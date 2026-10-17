"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  CalendarCheck,
  ChevronRight,
  House,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { initialsFor, type CurrentUser } from "@/lib/user";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function isActive(pathname: string, href: string) {
  if (href === "/profile") {
    return pathname === "/profile";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildNavigation(user: CurrentUser): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: "Account",
      items: [
        { label: "Overview", href: "/profile", icon: LayoutDashboard },
        { label: "Personal information", href: "/profile/personal", icon: UserRound },
        { label: "Security", href: "/profile/security", icon: KeyRound },
      ],
    },
    {
      label: "Activity",
      items: [{ label: "Bookings", href: "/profile/activity", icon: CalendarCheck }],
    },
  ];

  if (user.role === "OWNER") {
    groups.push({
      label: "Hosting",
      items: [{ label: "My listings", href: "/profile/hosting", icon: Building2 }],
    });
  }

  if (user.isAdmin) {
    groups.push({
      label: "Administration",
      items: [{ label: "Admin console", href: "/profile/admin", icon: ShieldAlert }],
    });
  }

  return groups;
}

export function ProfileShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const navigation = buildNavigation(user);
  const initials = initialsFor(user.name, user.email);

  const activeItem = navigation
    .flatMap((group) => group.items)
    .find((item) => isActive(pathname, item.href));

  const roleLabel = user.isAdmin ? "Administrator" : user.role === "OWNER" ? "Host account" : "Guest account";

  return (
    <div className={cn("erp-shell", navOpen && "erp-shell-open")}>
      <div className="erp-overlay" aria-hidden="true" onClick={() => setNavOpen(false)} />

      <aside className="erp-sidebar">
        <div className="erp-sidebar-head">
          <Link className="erp-brand" href="/" aria-label="liveAir home">
            <span className="brand-mark"><House size={17} strokeWidth={2.1} /></span>
            <span>live<span>Air</span></span>
          </Link>
        </div>

        <div className="erp-user">
          <span className="erp-avatar">{initials}</span>
          <span className="erp-user-meta">
            <span className="erp-user-name">{user.name ?? "Your account"}</span>
            <span className="erp-user-role"><span className="erp-dot" />{roleLabel}</span>
          </span>
        </div>

        <nav className="erp-nav" aria-label="Account navigation">
          {navigation.map((group) => (
            <div className="erp-nav-group" key={group.label}>
              <p className="erp-nav-label">{group.label}</p>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    className={cn("erp-nav-link", active && "erp-nav-active")}
                    href={item.href}
                    key={item.href}
                    onClick={() => setNavOpen(false)}
                  >
                    <item.icon strokeWidth={1.9} />
                    <span>{item.label}</span>
                    {active && <ChevronRight className="erp-nav-caret" size={15} />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="erp-sidebar-foot">
          <button className="erp-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="erp-main">
        <header className="erp-topbar">
          <button
            className="erp-icon-btn erp-menu-btn"
            type="button"
            aria-label="Open navigation"
            onClick={() => setNavOpen(true)}
          >
            <Menu size={19} />
          </button>

          <div className="erp-crumbs">
            <span className="erp-crumb-trail">
              Account
              <ChevronRight size={12} />
              {activeItem?.label ?? "Overview"}
            </span>
            <h1>{activeItem?.label ?? "Overview"}</h1>
          </div>

          <Link className="erp-me ml-auto" href="/profile">
            <span className="erp-me-avatar">{initials}</span>
            <span className="erp-me-name">{user.name ?? "Account"}</span>
          </Link>
        </header>

        <main className="erp-canvas">{children}</main>
      </div>
    </div>
  );
}
