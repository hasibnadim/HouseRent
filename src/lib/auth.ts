import { compare } from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { db } from "@/prisma/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await db.orm.liveBnb.User.where({ email }).first();
        if (!user?.passwordHash || user.isSuspended) return null;

        const isValidPassword = await compare(password, user.passwordHash);
        if (!isValidPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "RENTER";
        session.user.isAdmin = token.isAdmin ?? false;
      }
      return session;
    },
  },
};