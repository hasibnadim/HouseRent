import { ShieldAlert } from "lucide-react";
import { ProfileEmptyState, ProfilePageHeader, ProfileRequestBoundary } from "@/components/profile/ui";
import { getCurrentUser } from "@/lib/session";

export const instant = false;

export default function AdminPage() {
  return (
    <ProfileRequestBoundary>
      <AdminContent />
    </ProfileRequestBoundary>
  );
}

async function AdminContent() {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return (
      <>
        <ProfilePageHeader eyebrow="Administration" title="Admin console" />
        <ProfileEmptyState
          icon={ShieldAlert}
          title="Admins only"
          description="You don't have permission to view the admin console. If you think this is a mistake, contact the platform team."
        />
      </>
    );
  }

  return (
    <>
      <ProfilePageHeader
        eyebrow="Administration"
        title="Admin console"
        description="Review listings, reports and platform activity. Tools will appear here as they become available."
      />
      <ProfileEmptyState
        icon={ShieldAlert}
        title="Nothing to review"
        description="There are no open reports or pending items right now. New moderation tasks will surface here."
      />
    </>
  );
}
