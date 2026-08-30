import Link from "next/link";
import { ArrowUpRight, Construction } from "lucide-react";

export default function AdminPlaceholder({ title, description, actionHref = "/admin", actionLabel = "Back to overview" }) {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0759d6]">Administration</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#182230] sm:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#667085]">{description}</p>
        <section className="mt-8 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-[#e3e7ee] bg-white px-6 text-center shadow-[0_4px_18px_rgba(16,24,40,0.035)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7f0ff] text-[#0759d6]"><Construction size={24} /></div>
          <h2 className="mt-4 text-lg font-bold text-[#273142]">This workspace is being prepared</h2>
          <p className="mt-1 max-w-md text-sm leading-6 text-[#758093]">The shared admin navigation is ready. Connect this page to its API when the management workflow is available.</p>
          <Link href={actionHref} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#dce2eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#354052] transition hover:bg-[#f6f8fb]">{actionLabel} <ArrowUpRight size={16} /></Link>
        </section>
      </div>
    </main>
  );
}
