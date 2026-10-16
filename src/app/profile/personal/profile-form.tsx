"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/profile/actions";
import { initialFormState } from "@/app/profile/form-state";

export function ProfileForm({
  user,
}: {
  user: { name: string | null; email: string; phone: string | null; image: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initialFormState);

  return (
    <form className="erp-form" action={formAction}>
      <label className="erp-field">
        <span>Full name</span>
        <input name="name" defaultValue={user.name ?? ""} maxLength={120} autoComplete="name" required />
      </label>

      <label className="erp-field">
        <span>
          Email address <small>cannot be changed</small>
        </span>
        <input value={user.email} readOnly disabled />
      </label>

      <label className="erp-field">
        <span>
          Phone number <small>optional</small>
        </span>
        <input
          name="phone"
          defaultValue={user.phone ?? ""}
          maxLength={32}
          autoComplete="tel"
          placeholder="+880 1XXX XXXXXX"
        />
      </label>

      <label className="erp-field">
        <span>
          Profile photo URL <small>optional</small>
        </span>
        <input name="image" defaultValue={user.image ?? ""} placeholder="https://…" />
      </label>

      {state.status === "error" && (
        <p className="erp-alert erp-alert-error" role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className="erp-alert erp-alert-ok" role="status">
          {state.message}
        </p>
      )}

      <div className="erp-actions">
        <button className="erp-btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <span className="erp-muted">Changes apply across your whole account.</span>
      </div>
    </form>
  );
}
