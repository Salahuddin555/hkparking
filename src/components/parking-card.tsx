import { AvailabilityPill } from "./availability-pill";
import type { ParkingSpace } from "@/data/spaces";
import { BatteryCharging, Car, MapPin, Star } from "lucide-react";

const districtColors: Record<ParkingSpace["district"], string> = {
  "Hong Kong Island": "from-brand-500/10 to-brand-500/5",
  Kowloon: "from-amber-500/10 to-amber-500/5",
  "New Territories": "from-emerald-500/10 to-emerald-500/5",
};

type Props = {
  space: ParkingSpace;
};

export function ParkingCard({ space }: Props) {
  return (
    <article className="glass-panel grid gap-6 p-6 transition hover:-translate-y-1 hover:shadow-2xl md:grid-cols-[220px,1fr]">
      <div className={`rounded-2xl bg-gradient-to-br ${districtColors[space.district]} p-4 text-sm text-slate-600`}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{space.district}</p>
        <p className="mt-4 text-lg font-semibold text-slate-900">{space.title}</p>
        <p className="text-sm">Hosted by {space.host}</p>
        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="font-medium text-slate-800">{space.rating.toFixed(1)}</span>
          <span>({space.reviews} reviews)</span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <MapPin className="h-4 w-4 text-brand-500" />
          <span>{space.address}</span>
          <AvailabilityPill availability={space.availability} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white/60 p-4 text-sm">
            <p className="text-xs text-slate-500">Hourly rate</p>
            <p className="text-2xl font-semibold text-slate-900">HK${space.hourlyRate}</p>
            <p className="text-slate-500">All fees included</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/60 p-4 text-sm">
            <p className="text-xs text-slate-500">Open slots</p>
            <p className="text-2xl font-semibold text-slate-900">
              {space.openSlots}/{space.totalSlots}
            </p>
            <p className="text-slate-500">Clearance {space.clearance}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/60 p-4 text-sm">
            <p className="text-xs text-slate-500">Amenities</p>
            <div className="mt-2 flex items-center gap-2 text-slate-600">
              <Car className="h-4 w-4" /> Private access
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <BatteryCharging className={`h-4 w-4 ${space.evFriendly ? "text-emerald-500" : "text-slate-300"}`} />
              {space.evFriendly ? "EV charger" : "No charger"}
            </div>
          </div>
        </div>
        <button className="mt-2 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/20">
          Request to book
        </button>
      </div>
    </article>
  );
}
