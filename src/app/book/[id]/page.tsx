import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Car, Clock, Phone } from "lucide-react";

import { AvailabilityPill } from "@/components/availability-pill";
import { BookingForm } from "@/components/booking-form";
import { parkingSpaces } from "@/data/spaces";
import { getParkingSpaceById } from "@/lib/parking-space-loader";
import { TransportFeedUnavailableError } from "@/lib/transport-feed";

type BookingPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return parkingSpaces.map((space) => ({ id: space.id }));
}

export async function generateMetadata({ params }: BookingPageProps): Promise<Metadata> {
  const { id } = params;
  try {
    const space = await getParkingSpaceById(id);
    const title = space ? `Request ${space.title} • HarborPark` : "Request parking • HarborPark";

    return {
      title,
      description: space
        ? `Send a booking request for ${space.title} hosted by ${space.host} in ${space.district}.`
        : "Send a private parking booking request on HarborPark.",
    };
  } catch (error) {
    if (error instanceof TransportFeedUnavailableError) {
      return {
        title: "Live parking temporarily unavailable • HarborPark",
        description: "Real-time parking data is temporarily unavailable. Please try again shortly.",
      };
    }
    throw error;
  }
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { id } = params;
  let transportError: TransportFeedUnavailableError | null = null;
  let space: Awaited<ReturnType<typeof getParkingSpaceById>>;

  try {
    space = await getParkingSpaceById(id);
  } catch (error) {
    if (error instanceof TransportFeedUnavailableError) {
      transportError = error;
      space = undefined;
    } else {
      throw error;
    }
  }

  if (!space && !transportError) {
    notFound();
  }

  if (transportError) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 text-slate-400" />
          Back to all spaces
        </Link>
        <section className="glass-panel flex flex-col gap-4 p-8 text-slate-700">
          <h1 className="text-2xl font-semibold text-slate-900">Live parking data is unavailable</h1>
          <p>
            We can&apos;t load the latest details for this Transport Department space right now. The public feed is
            temporarily unavailable, so booking information may be out of date.
          </p>
          <p>Please try again in a few minutes or pick another space while we reconnect.</p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Technical details</p>
            <p>{transportError.message}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-3 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 text-slate-400" />
        Back to all spaces
      </Link>

      <header className="glass-panel flex flex-col gap-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{space.district}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{space.title}</h1>
            <p className="text-slate-500">Hosted by {space.host}</p>
          </div>
          <AvailabilityPill availability={space.availability} />
        </div>
        <div className="grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Hourly rate</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">HK${space.hourlyRate}</p>
            <p>Transparent, all fees included.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Open slots</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {space.openSlots}/{space.totalSlots}
            </p>
            <p>Clearance limit {space.clearance}.</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Response time</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">~15 minutes</p>
            <p>SMS + email confirmation.</p>
          </div>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr]">
        <BookingForm spaceId={space.id} host={space.host} evFriendly={space.evFriendly} clearance={space.clearance} />

        <aside className="glass-panel flex flex-col gap-6 p-8 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-900/90 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">You&rsquo;re almost there</p>
            <p className="mt-3 text-lg font-semibold">
              {space.openSlots > 0 ? "Slots are open right now." : "Host will offer the next opening."}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {space.host} usually replies within 15 minutes between 7am–11pm HKT.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <Calendar className="h-10 w-10 rounded-full bg-slate-100 p-2 text-brand-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Flexible windows</p>
              <p className="text-slate-700">Hosts hold the spot for 30 minutes around your arrival.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <Clock className="h-10 w-10 rounded-full bg-slate-100 p-2 text-brand-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Need help?</p>
              <p className="text-slate-700">Concierge line +852 3000 1234 replies in under 2 minutes.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <Phone className="h-10 w-10 rounded-full bg-slate-100 p-2 text-brand-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Host contact</p>
              <p className="text-slate-700">Shared automatically once the booking is confirmed.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4">
            <Car className="h-10 w-10 rounded-full bg-slate-100 p-2 text-brand-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Vehicle fit</p>
              <p className="text-slate-700">Max height {space.clearance}. EV charger {space.evFriendly ? "available" : "not available"}.</p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
