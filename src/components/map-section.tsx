import type { ParkingSpace } from "@/data/spaces";

const toPercent = (value: number) => `${((value + 90) / 180) * 100}%`;

export function MapSection({ spaces }: { spaces: ParkingSpace[] }) {
  return (
    <div className="glass-panel relative min-h-[320px] overflow-hidden p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(60,99,241,0.18),_transparent_45%)]" />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Live map</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">Harbor-wide coverage</h3>
          <p className="text-sm text-slate-500">Tap a pulse to view details — data refreshes every few seconds.</p>
        </div>
        <div className="hidden text-right text-sm text-slate-500 md:block">
          <p>{spaces.length} curated private hosts</p>
          <p>Trusted and verified by HarborPark</p>
        </div>
      </div>
      <div className="relative mt-8 h-72 rounded-3xl border border-white/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/1/12/Hong_Kong_Districts.svg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        {spaces.map((space) => (
          <button
            key={space.id}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white/80 px-3 py-1 text-xs font-medium text-slate-800 shadow-lg transition hover:scale-110`}
            style={{
              left: toPercent(space.lng - 114.0),
              top: toPercent(space.lat - 22.2),
            }}
          >
            {space.openSlots} open
          </button>
        ))}
      </div>
    </div>
  );
}
