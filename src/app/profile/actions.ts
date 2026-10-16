"use server";

import { compare, hash } from "bcryptjs";
import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/prisma/db";
import type { FormState } from "./form-state";

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const imageRaw = String(formData.get("image") ?? "").trim();

  if (!name) {
    return { status: "error", message: "Please enter your name." };
  }
  if (name.length > 120) {
    return { status: "error", message: "Name must be 120 characters or fewer." };
  }
  if (phoneRaw.length > 32) {
    return { status: "error", message: "Phone number must be 32 characters or fewer." };
  }
  if (imageRaw && !/^https?:\/\//i.test(imageRaw)) {
    return { status: "error", message: "Photo must be a valid http(s) URL." };
  }

  const phone = phoneRaw || null;

  if (phone) {
    const existing = await db.orm.mytour.User.where({ phone }).first();
    if (existing && existing.id !== me.id) {
      return { status: "error", message: "That phone number is already linked to another account." };
    }
  }

  await db.orm.mytour.User.where({ email: me.email }).update({
    name,
    phone,
    image: imageRaw || null,
  });

  refresh();
  return { status: "success", message: "Profile updated." };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const me = await getCurrentUser();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next.length < 8) {
    return { status: "error", message: "New password must be at least 8 characters." };
  }
  if (new TextEncoder().encode(next).length > 72) {
    return { status: "error", message: "New password is too long." };
  }
  if (next === current) {
    return { status: "error", message: "Choose a password different from your current one." };
  }
  if (next !== confirm) {
    return { status: "error", message: "New passwords do not match." };
  }

  const record = await db.orm.mytour.User.where({ email: me.email }).first();
  if (!record?.passwordHash) {
    return { status: "error", message: "This account has no password to change." };
  }

  const valid = await compare(current, record.passwordHash);
  if (!valid) {
    return { status: "error", message: "Your current password is incorrect." };
  }

  const passwordHash = await hash(next, 12);
  await db.orm.mytour.User.where({ email: me.email }).update({ passwordHash });

  refresh();
  return { status: "success", message: "Password updated." };
}
