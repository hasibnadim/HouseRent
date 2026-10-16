import { Suspense } from "react";
import { House } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function ProfileRequestBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ProfileLoading />}>{children}</Suspense>;
}

export function ProfileLoading() {
  return (
    <div className="profile-loading" aria-busy="true" role="status">
      <span className="brand-mark"><House size={20} /></span>
      <span>Loading your account</span>
    </div>
  );
}

export function ProfilePageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="erp-page-head">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="erp-page-action">{action}</div>}
    </div>
  );
}

export function ProfileEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="erp-empty">
      <span className="erp-empty-icon">
        <Icon size={22} strokeWidth={1.7} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
