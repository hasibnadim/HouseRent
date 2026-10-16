import { KeyRound, ShieldCheck } from "lucide-react";
import { ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { PasswordForm } from "./password-form";

export const instant = false;

export default function SecurityPage() {
  return (
    <ProfileRequestBoundary>
      <SecurityContent />
    </ProfileRequestBoundary>
  );
}

async function SecurityContent() {
  const user = await getCurrentUser();

  return (
    <>
      <ProfilePageHeader
        eyebrow="Account"
        title="Security"
        description="Protect your account with a strong, unique password you don't use anywhere else."
      />

      <div className="erp-grid erp-cols-2">
        <section className="erp-card">
          <div className="erp-card-head">
            <span className="erp-card-title"><KeyRound size={16} /> Change password</span>
          </div>
          <PasswordForm />
        </section>

        <aside className="erp-card erp-card-aside">
          <div className="erp-card-head">
            <span className="erp-card-title"><ShieldCheck size={16} /> Sign-in email</span>
          </div>
          <p className="erp-trust">
            <strong>{user.email}</strong> is the email used to sign in to your liveAir account.
          </p>
          <ul className="erp-checklist erp-checklist-plain">
            <li className="erp-check">Use at least 8 characters.</li>
            <li className="erp-check">Mix letters, numbers and symbols.</li>
            <li className="erp-check">Never reuse a password from another site.</li>
          </ul>
        </aside>
      </div>
    </>
  );
}
