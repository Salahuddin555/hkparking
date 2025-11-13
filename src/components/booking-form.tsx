"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

type Props = {
  spaceId: string;
  host: string;
  evFriendly: boolean;
  clearance: string;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

const BOOKINGS_ENDPOINT = process.env.NEXT_PUBLIC_BOOKINGS_ENDPOINT ?? "/api/bookings";

export function BookingForm({ spaceId, host, evFriendly, clearance }: Props) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const helperText = useMemo(() => {
    if (status === "success") {
      return `We texted ${host}. Expect a reply shortly.`;
    }

    if (status === "error") {
      return errorMessage || "Something went wrong. Try again.";
    }

    return `We send your request to ${host}. You’ll get SMS + email when they accept.`;
  }, [errorMessage, host, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      spaceId,
      fullName: (formData.get("fullName") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      vehiclePlate: (formData.get("vehiclePlate") as string) ?? "",
      arrival: (formData.get("arrival") as string) ?? "",
      departure: (formData.get("departure") as string) ?? "",
      notes: (formData.get("notes") as string) ?? "",
      requiresEv: formData.get("requiresEv") === "on",
    };

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(BOOKINGS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "Failed to submit");
      }

      form.reset();
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Request failed.");
    }
  };

  return (
    <form className="glass-panel flex flex-col gap-6 p-8" onSubmit={handleSubmit}>
      <div>
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Step 2</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Share your trip details</h2>
        <p className="text-sm text-slate-500">{helperText}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name">
          <input
            type="text"
            name="fullName"
            required
            className={inputClasses}
            placeholder="Jamie Chen"
            disabled={status === "submitting"}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            name="email"
            required
            className={inputClasses}
            placeholder="jamie@email.com"
            disabled={status === "submitting"}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            name="phone"
            required
            className={inputClasses}
            placeholder="+852 9123 4567"
            disabled={status === "submitting"}
          />
        </Field>
        <Field label="Vehicle plate">
          <input
            type="text"
            name="vehiclePlate"
            required
            className={inputClasses}
            placeholder="AB 1234"
            disabled={status === "submitting"}
          />
        </Field>
        <Field label="Arrival time">
          <input type="datetime-local" name="arrival" required className={inputClasses} disabled={status === "submitting"} />
        </Field>
        <Field label="Departure time">
          <input
            type="datetime-local"
            name="departure"
            required
            className={inputClasses}
            disabled={status === "submitting"}
          />
        </Field>
        <Field label="Need EV charger?">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="requiresEv" className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40" />
            I need EV charging ({evFriendly ? "available" : "host will advise alternatives"})
          </label>
        </Field>
        <Field label="Vehicle clearance OK?">
          <p className="text-base text-slate-700">Max height {clearance}. Taller rigs should mention it in notes.</p>
        </Field>
      </div>

      <Field label="Notes for the host">
        <textarea
          name="notes"
          rows={4}
          className={`${inputClasses} resize-none`}
          placeholder="Share arrival details, EV needs, or anything special."
          disabled={status === "submitting"}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:shadow-none"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send request
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </>
        )}
      </button>

      {status === "success" && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" aria-live="assertive">
          Booking request sent—watch for a confirmation text shortly.
        </p>
      )}
      {status === "error" && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700" aria-live="assertive">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

const inputClasses =
  "rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-base text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-70";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-slate-600">
      {label}
      {children}
    </label>
  );
}
