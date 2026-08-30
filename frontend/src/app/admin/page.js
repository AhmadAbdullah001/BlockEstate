"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Clock3, Flag, Upload, UserCheck, RefreshCw, Hourglass } from "lucide-react";
import { getAdminOverview, getCurrentUser } from "../../services/auth.service";

const cardStyles = { blue: "bg-[#e8f0ff] text-[#0759d6]", amber: "bg-[#fff4dc] text-[#d48100]", green: "bg-[#e5f8ef] text-[#16824d]", red: "bg-[#ffe9e7] text-[#d0443f]" };

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalProperties: 0, verifiedProperties: 0, pendingVerification: 0, flaggedProperties: 0, verificationQueue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      try {
        const meResponse = await getCurrentUser();
        const user = meResponse?.data?.data?.user;

        if (!user || !Array.isArray(user.roles) || !user.roles.includes("ADMIN")) {
          router.replace("/login");
          return;
        }

        const overviewResponse = await getAdminOverview();
        if (!active) return;

        setStats((current) => ({
          ...current,
          ...overviewResponse.data?.data?.stats,
        }));
      } catch (requestError) {
        if (!active) return;

        if (requestError?.response?.status === 401 || requestError?.response?.status === 403) {
          router.replace("/login");
          return;
        }

        setError("We could not load the latest figures. Please try again shortly.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, [router]);

  const cards = [
    { label: "Total properties", value: stats.totalProperties, icon: Building2, tone: "blue" }, { label: "Pending verification", value: stats.pendingVerification, icon: Clock3, tone: "amber" }, { label: "Verified listings", value: stats.verifiedProperties, icon: CheckCircle2, tone: "green" }, { label: "Flagged listings", value: stats.flaggedProperties, icon: Flag, tone: "red" },
  ];
  const pipeline = [
    { label: "Submitted", value: stats.submitted ?? stats.pendingVerification ?? 0, icon: Upload },
    { label: "Agent assigned", value: stats.agentAssigned ?? 0, icon: UserCheck },
    { label: "In progress", value: stats.inProgress ?? stats.verificationQueue ?? 0, icon: RefreshCw, active: true },
    { label: "Awaiting completion", value: stats.awaitingCompletion ?? 0, icon: Hourglass },
  ];

  return <main className="px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl">
    <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0759d6]">Administration</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-[#182230] sm:text-[34px]">Overview</h1><p className="mt-2 text-[15px] text-[#667085]">Real-time system health and verification status.</p></div>
    {error && <div className="mb-6 rounded-xl border border-[#fecaca] bg-[#fff6f5] px-4 py-3 text-sm text-[#b42318]">{error}</div>}
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} className="min-h-[164px] rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_4px_18px_rgba(16,24,40,0.035)]"><div className="flex items-start justify-between"><p className="max-w-[160px] text-xs font-bold uppercase tracking-[0.1em] text-[#758093]">{label}</p><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${cardStyles[tone]}`}><Icon size={21} /></span></div><p className="mt-8 text-4xl font-bold tracking-[-0.04em] text-[#182230]">{loading ? "—" : value}</p></article>)}</section>
    <section className="mt-8 rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_4px_18px_rgba(16,24,40,0.035)] sm:p-7"><div><h2 className="text-xl font-bold tracking-[-0.025em] text-[#273142]">Verification pipeline</h2><p className="mt-1 text-sm text-[#758093]">A clear view of every listing moving through review.</p></div><div className="relative mt-10"><div className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-[#dce3ed] md:block" /><div className="relative grid grid-cols-2 gap-8 md:grid-cols-4">{pipeline.map(({ label, value, icon: Icon, active }) => <div key={label} className="flex flex-col items-center text-center"><span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${active ? "border-[#0759d6] bg-[#0759d6] text-white shadow-[0_0_0_5px_#e6efff]" : "border-[#b9d0fb] bg-white text-[#0759d6]"}`}><Icon size={20} className={active ? "animate-spin [animation-duration:3s]" : ""} /></span><p className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[#273142]">{loading ? "—" : value}</p><p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.1em] ${active ? "text-[#0759d6]" : "text-[#758093]"}`}>{label}</p></div>)}</div></div></section>
  </div></main>;
}
