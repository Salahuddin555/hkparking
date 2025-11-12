import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-10 text-slate-600 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">HarborPark</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">We couldn&rsquo;t find that page</h1>
        <p className="mt-2 text-base">
          The parking request you&rsquo;re looking for might have moved or never existed. Double-check the link or head back to explore available hosts.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all spaces
        </Link>
      </div>
    </main>
  );
}
