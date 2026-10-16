"use client";

import { useActionState, useState } from "react";
import { Check, X } from "lucide-react";
import { cancelBooking, respondToBooking } from "@/app/bookings/actions";
import { initialFormState } from "@/app/profile/form-state";

export function CancelBookingButton({ bookingId, title }: { bookingId: string; title: string }) {
  const [state, formAction, pending] = useActionState(cancelBooking, initialFormState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Cancel your request for "${title}"?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={bookingId} />
      {state.status === "error" && (
        <p className="erp-alert erp-alert-error" role="alert">
          {state.message}
        </p>
      )}
      <button className="erp-btn erp-btn-ghost" type="submit" disabled={pending}>
        <X size={15} />
        {pending ? "Cancelling…" : "Cancel request"}
      </button>
    </form>
  );
}

export function RespondToBookingForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(respondToBooking, initialFormState);
  const [declining, setDeclining] = useState(false);

  return (
    <form action={formAction} className="book-respond">
      <input type="hidden" name="id" value={bookingId} />
      {state.status === "error" && (
        <p className="erp-alert erp-alert-error" role="alert">
          {state.message}
        </p>
      )}
      {!declining ? (
        <div className="book-respond-row">
          <button className="erp-btn" type="submit" name="decision" value="approve" disabled={pending}>
            <Check size={15} />
            {pending ? "Saving…" : "Approve"}
          </button>
          <button
            className="erp-btn erp-btn-ghost"
            type="button"
            disabled={pending}
            onClick={() => setDeclining(true)}
          >
            Decline
          </button>
        </div>
      ) : (
        <>
          <label className="erp-field">
            <span>Reason for declining</span>
            <input name="reason" maxLength={500} required placeholder="Those dates are already taken…" />
          </label>
          <div className="book-respond-row">
            <button className="erp-btn erp-btn-danger" type="submit" name="decision" value="decline" disabled={pending}>
              {pending ? "Saving…" : "Confirm decline"}
            </button>
            <button
              className="erp-btn erp-btn-ghost"
              type="button"
              disabled={pending}
              onClick={() => setDeclining(false)}
            >
              Back
            </button>
          </div>
        </>
      )}
    </form>
  );
}
