import type { Char } from "@prisma/orm-postgres/target/codec-types";

export type CurrentUser = {
  id: Char<36>;
  name: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: "RENTER" | "OWNER";
  isAdmin: boolean;
  createdAt: string;
};

export function initialsFor(name: string | null, email: string): string {
  const source = (name ?? "").trim() || email;
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "");
  const initials = letters.join("").toUpperCase();

  return initials || "U";
}
