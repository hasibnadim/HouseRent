"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteListing } from "@/app/profile/hosting/actions";
import { initialFormState } from "@/app/profile/form-state";

export function DeleteListingForm({ listingId, title }: { listingId: string; title: string }) {
  const [state, formAction, pending] = useActionState(deleteListing, initialFormState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={listingId} />
      {state.status === "error" && (
        <p className="erp-alert erp-alert-error" role="alert">
          {state.message}
        </p>
      )}
      <button className="erp-btn erp-btn-danger" type="submit" disabled={pending}>
        <Trash2 size={15} />
        {pending ? "Deleting…" : "Delete listing"}
      </button>
    </form>
  );
}
