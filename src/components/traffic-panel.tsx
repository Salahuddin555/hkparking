import { Activity, AlertTriangle, Clock } from "lucide-react";
import type { TransportFeedStatus } from "@/lib/use-parking-feed";
import type { TrafficIncident } from "@/types/transport";

type Props = {
  traffic: {
    incidents: TrafficIncident[];
    sourceTimestamps: {
      incidents?: string;
    };
  };
  status: TransportFeedStatus;
};

const severityBadge: Record<TrafficIncident["severity"], string> = {
  critical: "bg-rose-50 text-rose-600 border-rose-200",
  major: "bg-amber-50 text-amber-600 border-amber-200",
  moderate: "bg-slate-100 text-slate-600 border-slate-200",
};

const severityLabel: Record<TrafficIncident["severity"], string> = {
  critical: "Critical disruption",
  major: "Major delay",
  moderate: "Advisory",
};

const formatTime = (iso?: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function TrafficPanel({ traffic, status }: Props) {
  const incidentTime = formatTime(traffic.sourceTimestamps.incidents);
  const incidents = traffic.incidents.slice(0, 8);
  const rows: TrafficIncident[][] = [];
  for (let i = 0; i < incidents.length; i += 4) {
    rows.push(incidents.slice(i, i + 4));
  }

  return (
    <section className="glass-panel flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Traffic pulse</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Transport Department live advisories</h2>
          <p className="text-sm text-slate-500">Powered by the Special Traffic News feed — lane closures, major incidents, and service updates.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium text-slate-600">
          <Activity className="h-4 w-4 text-brand-500" />
          {status === "loading" && "Connecting to HKTD…"}
          {status === "ready" && "HKTD link healthy"}
          {status === "error" && "HKTD feed offline — showing last snapshot"}
        </div>
      </header>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock className="h-3.5 w-3.5 text-brand-500" />
        {incidentTime ? `Last updated ${incidentTime}` : "Awaiting pulse"}
      </div>

      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
          No active advisories from the Transport Department at the moment.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {rows.map((row, rowIndex) => {
          const duplicated = [...row, ...row];
          const animationDuration = Math.max(row.length * 6, 18);
          return (
            <div key={`ticker-row-${rowIndex}`} className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80">
              <div
                className="flex min-w-max gap-4 py-4 animate-ticker"
                style={{
                  animationDuration: `${animationDuration}s`,
                  animationDirection: rowIndex % 2 === 0 ? "normal" : "reverse",
                }}
              >
                {duplicated.map((incident, idx) => (
                  <article
                    key={`${incident.id}-${idx}`}
                    className="flex min-w-[220px] max-w-[260px] flex-col rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${severityBadge[incident.severity]}`}>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {severityLabel[incident.severity]}
                      </span>
                      {incident.startTime && (
                        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{formatTime(incident.startTime) ?? incident.startTime}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{incident.title}</p>
                    <p className="text-xs text-slate-500">{incident.location ?? incident.region}</p>
                    {incident.description && <p className="mt-2 text-xs text-slate-600">{incident.description}</p>}
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
