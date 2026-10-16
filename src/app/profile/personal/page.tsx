import { IdCard } from "lucide-react";
import { ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { initialsFor } from "@/lib/user";
import { ProfileForm } from "./profile-form";

export const instant = false;

export default function PersonalInformationPage() {
  return (
    <ProfileRequestBoundary>
      <PersonalInformationContent />
    </ProfileRequestBoundary>
  );
}

async function PersonalInformationContent() {
  const user = await getCurrentUser();

  return (
    <>
      <ProfilePageHeader
        eyebrow="Account"
        title="Personal information"
        description="Update the details guests and hosts see, and keep your contact number current for bookings."
      />

      <div className="erp-grid erp-cols-2">
        <section className="erp-card">
          <div className="erp-card-head">
            <span className="erp-card-title"><IdCard size={16} /> Your details</span>
          </div>
          <ProfileForm
            user={{ name: user.name, email: user.email, phone: user.phone, image: user.image }}
          />
        </section>

        <aside className="erp-card erp-card-aside">
          <div className="erp-profile-row">
            <span className="erp-avatar erp-avatar-lg">{initialsFor(user.name, user.email)}</span>
            <div>
              <strong className="erp-profile-name">{user.name ?? "Add your name"}</strong>
              <span className="erp-muted">{user.email}</span>
            </div>
          </div>
          <p className="erp-trust">
            Add a photo and a phone number so hosts and guests can recognise and reach you with confidence.
          </p>
        </aside>
      </div>
    </>
  );
}
