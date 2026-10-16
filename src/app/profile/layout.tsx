import { Suspense } from "react";
import { House } from "lucide-react";
import { ProfileShell } from "@/components/profile/profile-shell";
import { getCurrentUser } from "@/lib/session";

export const instant = false;

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <AuthenticatedProfileLayout>{children}</AuthenticatedProfileLayout>
    </Suspense>
  );
}

async function AuthenticatedProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return <ProfileShell user={user}>{children}</ProfileShell>;
}

function ProfileLoading() {
  return (
    <main className="profile-loading" aria-busy="true">
      <span className="brand-mark"><House size={20} /></span>
      <span>Loading your account</span>
    </main>
  );
}
