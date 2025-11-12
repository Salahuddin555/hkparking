type Props = {
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ label, value, helper }: Props) {
  return (
    <div className="flex flex-col rounded-3xl bg-gradient-to-br from-white to-slate-50/30 p-6 shadow-card">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      {helper && <span className="text-sm text-slate-500">{helper}</span>}
    </div>
  );
}
