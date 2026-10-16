"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/profile/actions";
import { initialFormState } from "@/app/profile/form-state";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialFormState);

  return (
    <form className="erp-form" action={formAction}>
      <label className="erp-field">
        <span>Current password</span>
        <input name="current" type="password" autoComplete="current-password" required />
      </label>

      <label className="erp-field">
        <span>
          New password <small>at least 8 characters</small>
        </span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required />
      </label>

      <label className="erp-field">
        <span>Confirm new password</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={8} required />
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
          {pending ? "Updating…" : "Update password"}
        </button>
        <span className="erp-muted">You will stay signed in on this device.</span>
      </div>
    </form>
  );
}
