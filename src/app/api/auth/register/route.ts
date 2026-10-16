import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Enter valid account details." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Enter valid account details." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const role = body.role === "OWNER" ? "OWNER" : body.role === "RENTER" ? "RENTER" : null;

  if (!name || name.length > 100) {
    return NextResponse.json({ error: "Enter your name (up to 100 characters)." }, { status: 400 });
  }
  if (email.length > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6 || new TextEncoder().encode(password).length > 72) {
    return NextResponse.json({ error: "Use at least 6 characters and no more than 72 UTF-8 bytes." }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: "Choose whether you are renting or hosting." }, { status: 400 });
  }
  if (phone.length > 32) {
    return NextResponse.json({ error: "Enter a phone number under 32 characters." }, { status: 400 });
  }

  try {
    const existingUser = await db.orm.mytour.User.where({ email }).first();
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    if (phone) {
      const existingPhone = await db.orm.mytour.User.where({ phone }).first();
      if (existingPhone) {
        return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 409 });
      }
    }

    const passwordHash = await hash(password, 12);
    await db.orm.mytour.User.create({
      name,
      email,
      passwordHash,
      role,
      ...(phone ? { phone } : {}),
    });

    return NextResponse.json({ message: "Account created." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We could not create your account. Please try again." }, { status: 500 });
  }
}