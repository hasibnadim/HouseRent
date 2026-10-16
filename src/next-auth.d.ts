import type { DefaultSession } from "next-auth";

type LiveAirRole = "RENTER" | "OWNER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: LiveAirRole;
      isAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: LiveAirRole;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: LiveAirRole;
    isAdmin?: boolean;
  }
}