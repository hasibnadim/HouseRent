import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Log in | liveAir",
  description: "Log in to your liveAir account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}