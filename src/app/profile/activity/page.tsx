import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { ProfileEmptyState, ProfilePageHeader } from "@/components/profile/ui";

export default function ActivityPage() {
  return (
    <>
      <ProfilePageHeader
        eyebrow="Activity"
        title="Bookings & reviews"
        description="Track your trips, upcoming check-ins and the reviews you've left or received."
      />
      <ProfileEmptyState
        icon={CalendarCheck}
        title="No activity yet"
        description="Once you book a stay or leave a review, it will show up here. Ready to plan your next trip?"
        action={
          <Link className="erp-btn" href="/">
            Browse stays
          </Link>
        }
      />
    </>
  );
}
