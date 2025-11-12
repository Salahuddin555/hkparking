"use client";

import { AlertTriangle, Loader2, Search } from "lucide-react";
import type { ParkingSpace } from "@/data/spaces";
import type { TransportFeedStatus } from "@/lib/use-parking-feed";

const districtOptions = [
  { label: "All districts", value: "all" },
  { label: "Hong Kong Island", value: "Hong Kong Island" },
  { label: "Kowloon", value: "Kowloon" },
  { label: "New Territories", value: "New Territories" },
];

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  district: string;
  onDistrictChange: (value: string) => void;
  evOnly: boolean;
  onEvChange: (value: boolean) => void;
  availability: string;
  onAvailabilityChange: (value: string) => void;
  spaces: ParkingSpace[];
  lastUpdated: Date;
  feedStatus: TransportFeedStatus;
  feedError?: string | null;
};

export function FilterBar({
  search,
  onSearchChange,
  district,
  onDistrictChange,
  evOnly,
  onEvChange,
  availability,
  onAvailabilityChange,
  spaces,
  lastUpdated,
  feedStatus,
  feedError,
}: Props) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Find a space</p>
        <div className="flex flex-col gap-4 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by host, address, or keyword"
              className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-10 pr-4 text-sm shadow-inner focus:border-brand-400 focus:outline-none"
            />
          </label>
          <select
            value={district}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-inner"
          >
            {districtOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={availability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-inner"
          >
            {[
              { value: "all", label: "Any availability" },
              { value: "high", label: "60%+ open" },
              { value: "medium", label: "35-60% open" },
              { value: "low", label: "Under 35%" },
              { value: "full", label: "Full" },
            ].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-white/40 pt-4 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={evOnly}
            onChange={(e) => onEvChange(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          />
          Only show EV-ready hosts
        </label>
        <p className="flex items-center gap-2">
          {spaces.length} active hosts •{" "}
          {feedStatus === "loading" && (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing with HKTD…
            </span>
          )}
          {feedStatus === "ready" && `Live at ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          {feedStatus === "error" && (
            <span className="inline-flex items-center gap-1 text-rose-500">
              <AlertTriangle className="h-4 w-4" />
              HKTD feed offline{feedError ? ` (${feedError})` : ""}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
