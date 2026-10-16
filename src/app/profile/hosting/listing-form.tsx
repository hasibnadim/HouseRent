"use client";

import { useActionState } from "react";
import { initialFormState, type FormState } from "@/app/profile/form-state";

export type ListingAction = (prev: FormState, formData: FormData) => Promise<FormState>;

export type ListingDefaults = {
  title: string;
  description: string;
  city: string;
  area: string;
  addressNote: string;
  sizeSqft: string;
  bedrooms: string;
  bathrooms: string;
  propertyType: string;
  furnished: boolean;
  amenities: string;
  monthlyRent: string;
  advanceAmount: string;
  serviceChargeNote: string;
  houseRules: string;
  availableFrom: string;
  availableTo: string;
  status: string;
  photoUrls: string;
};

export const emptyListingDefaults: ListingDefaults = {
  title: "",
  description: "",
  city: "",
  area: "",
  addressNote: "",
  sizeSqft: "",
  bedrooms: "2",
  bathrooms: "2",
  propertyType: "APARTMENT",
  furnished: false,
  amenities: "",
  monthlyRent: "",
  advanceAmount: "",
  serviceChargeNote: "",
  houseRules: "",
  availableFrom: "",
  availableTo: "",
  status: "DRAFT",
  photoUrls: "",
};

const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "ROOM", "VILLA", "OTHER"] as const;

export function ListingForm({
  action,
  defaults,
  listingId,
  submitLabel,
  statusOptions,
}: {
  action: ListingAction;
  defaults: ListingDefaults;
  listingId?: string;
  submitLabel: string;
  statusOptions: readonly string[];
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  return (
    <form className="erp-form erp-form-wide" action={formAction}>
      {listingId && <input type="hidden" name="id" value={listingId} />}

      <label className="erp-field erp-form-full">
        <span>Title</span>
        <input name="title" defaultValue={defaults.title} maxLength={120} required placeholder="Bright 3-bed flat near Dhanmondi Lake" />
      </label>

      <label className="erp-field erp-form-full">
        <span>Description <small>at least 20 characters</small></span>
        <textarea name="description" defaultValue={defaults.description} rows={4} required placeholder="Light, ventilation, nearby schools and markets…" />
      </label>

      <div className="erp-form-grid">
        <label className="erp-field">
          <span>City</span>
          <input name="city" defaultValue={defaults.city} maxLength={80} required placeholder="Dhaka" />
        </label>
        <label className="erp-field">
          <span>Area</span>
          <input name="area" defaultValue={defaults.area} maxLength={80} required placeholder="Dhanmondi" />
        </label>
        <label className="erp-field">
          <span>Property type</span>
          <select name="propertyType" defaultValue={defaults.propertyType}>
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="erp-field">
          <span>Status</span>
          <select name="status" defaultValue={defaults.status}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="erp-field">
          <span>Monthly rent (BDT)</span>
          <input name="monthlyRent" defaultValue={defaults.monthlyRent} inputMode="numeric" required placeholder="25000" />
        </label>
        <label className="erp-field">
          <span>Advance / deposit (BDT) <small>optional</small></span>
          <input name="advanceAmount" defaultValue={defaults.advanceAmount} inputMode="numeric" placeholder="50000" />
        </label>
        <label className="erp-field">
          <span>Size (sqft)</span>
          <input name="sizeSqft" defaultValue={defaults.sizeSqft} inputMode="numeric" required placeholder="1200" />
        </label>
        <label className="erp-field">
          <span>Bedrooms</span>
          <input name="bedrooms" defaultValue={defaults.bedrooms} inputMode="numeric" required />
        </label>
        <label className="erp-field">
          <span>Bathrooms</span>
          <input name="bathrooms" defaultValue={defaults.bathrooms} inputMode="numeric" required />
        </label>
        <label className="erp-field">
          <span>Available from <small>optional</small></span>
          <input type="date" name="availableFrom" defaultValue={defaults.availableFrom} />
        </label>
        <label className="erp-field erp-form-full">
          <span>Available to <small>optional</small></span>
          <input type="date" name="availableTo" defaultValue={defaults.availableTo} />
        </label>
      </div>

      <label className="erp-checkrow">
        <input type="checkbox" name="furnished" defaultChecked={defaults.furnished} />
        <span>Furnished property</span>
      </label>

      <label className="erp-field">
        <span>Address note <small>optional</small></span>
        <input name="addressNote" defaultValue={defaults.addressNote} maxLength={300} placeholder="House 12, Road 5 — near the lake" />
      </label>

      <label className="erp-field">
        <span>Amenities <small>comma separated, optional</small></span>
        <input name="amenities" defaultValue={defaults.amenities} placeholder="WiFi, Generator, Parking, Lift" />
      </label>

      <label className="erp-field">
        <span>Service charge note <small>optional</small></span>
        <input name="serviceChargeNote" defaultValue={defaults.serviceChargeNote} maxLength={300} placeholder="Service charge included" />
      </label>

      <label className="erp-field">
        <span>House rules <small>optional</small></span>
        <textarea name="houseRules" defaultValue={defaults.houseRules} rows={3} placeholder="No smoking, no pets, quiet hours after 10pm…" />
      </label>

      <label className="erp-field">
        <span>Photo URLs <small>one per line, up to 10, optional</small></span>
        <textarea name="photoUrls" defaultValue={defaults.photoUrls} rows={3} placeholder={"https://…/living-room.jpg\nhttps://…/bedroom.jpg"} />
      </label>

      {state.status === "error" && (
        <p className="erp-alert erp-alert-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="erp-actions">
        <button className="erp-btn" type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
