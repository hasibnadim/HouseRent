import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Create account | liveAir",
  description: "Create a liveAir account to rent or host a home.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}