import clsx from "clsx";
import type { ParkingSpace } from "@/data/spaces";

const palettes: Record<ParkingSpace["availability"], string> = {
  high: "bg-emerald-50 text-emerald-600 border-emerald-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-rose-50 text-rose-600 border-rose-200",
  full: "bg-slate-200 text-slate-500 border-slate-300",
};

const labels: Record<ParkingSpace["availability"], string> = {
  high: "Plenty open",
  medium: "Moderate",
  low: "Filling fast",
  full: "Full",
};

type Props = {
  availability: ParkingSpace["availability"];
};

export function AvailabilityPill({ availability }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        palettes[availability]
      )}
    >
      {labels[availability]}
    </span>
  );
}
