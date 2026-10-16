import { redirect } from "next/navigation";
import { io } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/prisma/db";
import type { CurrentUser } from "@/lib/user";

export async function getCurrentUser(): Promise<CurrentUser> {
  await io();
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  const user = await db.orm.mytour.User.where({ email }).first();

  if (!user || user.isSuspended) {
    redirect("/login");
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    phone: user.phone ?? null,
    image: user.image ?? null,
    role: user.role,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
}
