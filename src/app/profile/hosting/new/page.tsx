import { ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";
import { Building2 } from "lucide-react";
import { ProfileEmptyState } from "@/components/profile/ui";
import { createListing } from "@/app/profile/hosting/actions";
import { ListingForm, emptyListingDefaults } from "@/app/profile/hosting/listing-form";

export const instant = false;

export default function NewListingPage() {
  return (
    <ProfileRequestBoundary>
      <NewListingContent />
    </ProfileRequestBoundary>
  );
}

async function NewListingContent() {
  const user = await getCurrentUser();

  if (user.role !== "OWNER") {
    return (
      <>
        <ProfilePageHeader eyebrow="Hosting" title="New listing" />
        <ProfileEmptyState
          icon={Building2}
          title="Host account required"
          description="This area is for owners who list properties on liveAir. Your account is currently set up as a guest."
        />
      </>
    );
  }

  return (
    <>
      <ProfilePageHeader
        eyebrow="Hosting"
        title="New listing"
        description="Describe the property, set the rent and publish when it is ready — or save as a draft."
      />
      <section className="erp-card">
        <ListingForm
          action={createListing}
          defaults={emptyListingDefaults}
          submitLabel="Create listing"
          statusOptions={["DRAFT", "PUBLISHED"]}
        />
      </section>
    </>
  );
}
