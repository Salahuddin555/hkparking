"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { parkingSpaces } from "@/data/spaces";
import { useParkingFeed } from "@/lib/use-parking-feed";
import { FilterBar } from "@/components/filter-bar";
import { ParkingCard } from "@/components/parking-card";
import { MapSection } from "@/components/map-section";
import { MetricCard } from "@/components/metric-card";
import { TrafficPanel } from "@/components/traffic-panel";

export default function Home() {
  const { spaces, lastUpdated, stats, traffic, status, error } = useParkingFeed(parkingSpaces);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [evOnly, setEvOnly] = useState(false);

  const filtered = useMemo(() => {
    return spaces.filter((space) => {
      const matchesSearch =
        space.title.toLowerCase().includes(search.toLowerCase()) ||
        space.address.toLowerCase().includes(search.toLowerCase()) ||
        space.host.toLowerCase().includes(search.toLowerCase());
      const matchesDistrict = district === "all" ? true : space.district === district;
      const matchesAvailability = availability === "all" ? true : space.availability === availability;
      const matchesEv = evOnly ? space.evFriendly : true;

      return matchesSearch && matchesDistrict && matchesAvailability && matchesEv;
    });
  }, [spaces, search, district, availability, evOnly]);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="glass-panel relative overflow-hidden p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-transparent" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-4 py-1 text-xs font-medium text-slate-600">
              <Sparkles className="h-4 w-4 text-brand-500" />
              HarborPark beta • Hong Kong
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
              Rent trusted private parking in Hong Kong with live availability.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Vetted residential podiums, rooftop decks, and village courtyards. Instant requests, transparent pricing, and EV-ready options in one map.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20">
                Launch host console
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-medium text-slate-900">
                Download driver app
              </button>
            </div>
            <dl className="mt-10 grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-[0.35em]">Coverage</dt>
                <dd className="text-2xl font-semibold text-slate-900">{spaces.length} hosts</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.35em]">Availability</dt>
                <dd className="text-2xl font-semibold text-slate-900">{stats.openSlots} slots</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.35em]">Refresh</dt>
                <dd className="text-2xl font-semibold text-slate-900">5s pulses</dd>
              </div>
            </dl>
          </div>
        </div>
        <MapSection spaces={spaces} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total slots" value={stats.totalSlots.toString()} helper="Across Harbour" />
          <MetricCard label="Live open" value={stats.openSlots.toString()} helper="Updated seconds ago" />
          <MetricCard label="Avg. hourly" value={`HK$${Math.round(stats.avgRate)}`} helper="All fees included" />
        </div>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          district={district}
          onDistrictChange={setDistrict}
          evOnly={evOnly}
          onEvChange={setEvOnly}
          availability={availability}
          onAvailabilityChange={setAvailability}
          spaces={spaces}
          lastUpdated={lastUpdated}
          feedStatus={status}
          feedError={error}
        />
      </section>

      <TrafficPanel traffic={traffic} status={status} />

      <section className="grid gap-6">
        {filtered.map((space) => (
          <ParkingCard key={space.id} space={space} />
        ))}
        {filtered.length === 0 && (
          <div className="glass-panel p-12 text-center text-slate-500">
            Nothing matches your filters right now. Try widening your search.
          </div>
        )}
      </section>
    </main>
  );
}
