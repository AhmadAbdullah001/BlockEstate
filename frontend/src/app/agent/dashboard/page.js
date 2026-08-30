"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Search,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { getAgentDashboard, getCurrentUser, logout } from "../../../services/auth.service";

const statusColors = {
  PENDING: "bg-[#fff5d6] text-[#b96b00]",
  IN_PROGRESS: "bg-[#eaf2ff] text-[#0759d6]",
  PASSED: "bg-[#eafaf0] text-[#16824d]",
  FAILED: "bg-[#fff1f1] text-[#bc2d2d]",
};

function formatCurrency(value) {
  if (!value) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return "Recently";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const meResponse = await getCurrentUser();
        const user = meResponse.data?.data?.user;

        if (!user?.roles?.includes("AGENT")) {
          await logout();
          router.push("/agent");
          return;
        }

        const response = await getAgentDashboard();
        setDashboard(response.data?.data || null);
      } catch (requestError) {
        const message = requestError.response?.data?.error?.message || requestError.message || "Unable to load the agent dashboard.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const metrics = useMemo(() => {
    if (!dashboard?.stats) return [];

    return [
      { label: "Assignments", value: dashboard.stats.totalAssignments, hint: "Active portfolio", tone: "bg-[#edf3ff] text-[#0759d6]", Icon: BriefcaseBusiness },
      { label: "In progress", value: dashboard.stats.activeAssignments, hint: "Needs attention", tone: "bg-[#fff4dc] text-[#b96b00]", Icon: Clock3 },
      { label: "Completed", value: dashboard.stats.completedAssignments, hint: "Reviewed", tone: "bg-[#eafaf0] text-[#16824d]", Icon: CheckCircle2 },
      { label: "Due soon", value: dashboard.stats.dueSoon, hint: "Priority queue", tone: "bg-[#fff1f1] text-[#bc2d2d]", Icon: TrendingUp },
    ];
  }, [dashboard]);

  const assignments = dashboard?.assignments || [];
  const recentActivity = dashboard?.recentActivity || [];
  const notifications = dashboard?.notifications || [];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-[#1b1b1d]">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse rounded-2xl border border-[#e7ecf5] bg-white p-6 shadow-sm">
            <div className="h-5 w-32 rounded bg-[#edf0f7]" />
            <div className="mt-4 h-10 w-72 rounded bg-[#edf0f7]" />
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-28 rounded-2xl bg-[#f3f6fb]" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-6 text-[#1b1b1d] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-2xl border border-[#e7ecf5] bg-white p-4 shadow-[0_10px_30px_rgba(12,24,40,.04)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#0759d6]">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[#0759d6]">BlockEstate</p>
              <h1 className="text-2xl font-bold tracking-[-.04em] text-[#1a2333]">Agent dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-[#e7ecf5] bg-[#f7f9fc] px-3 py-2 text-sm text-[#667085]">
              <Search size={16} />
              <input aria-label="Search assignments" placeholder="Search assignments" className="w-40 bg-transparent outline-none placeholder:text-[#98a3b4]" />
            </div>
            <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7ecf5] bg-[#f7f9fc] text-[#667085]">
              <Bell size={18} />
              {notifications.length > 0 ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ef5a5a]" /> : null}
            </button>
            <div className="flex items-center gap-3 rounded-xl border border-[#e7ecf5] bg-[#f7f9fc] px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfeaff] text-[#0759d6]">
                <UserRound size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1a2333]">{dashboard?.agent?.fullName || "Agent"}</p>
                <p className="text-[11px] uppercase tracking-[.12em] text-[#7b8898]">Verified</p>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mt-5 rounded-xl border border-[#fed6d6] bg-[#fff1f1] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[#e7ecf5] bg-[#121b2a] p-4 text-white shadow-[0_18px_30px_rgba(18,27,42,.15)]">
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eff4ff] text-[#0d4fd5]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[.12em] text-[#afbad7]">Portal</p>
                <p className="font-semibold text-white">Property agent</p>
              </div>
            </div>

            <nav className="space-y-2">
              {[
                { label: "Overview", href: "/agent/dashboard", icon: LayoutDashboard, active: true },
                { label: "My Properties", href: "/agent/properties", icon: ClipboardCheck },
                { label: "Messages", href: "/agent/messages", icon: MessageSquareText },
                { label: "Profile", href: "/agent/profile", icon: UserRound },
              ].map(({ label, href, icon: Icon, active }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active ? "bg-[#1c2a42] text-white" : "text-[#d5dcf0] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[.12em] text-[#afbad7]">Quick status</p>
              <p className="mt-3 text-2xl font-bold text-white">{dashboard?.stats?.activeAssignments ?? 0}</p>
              <p className="text-sm text-[#d5dcf0]">Open verification tasks</p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/agent");
              }}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-3 py-3 text-sm font-medium text-[#dfe9ff] hover:bg-white/5"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </aside>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map(({ label, value, hint, tone, Icon }) => (
                <article key={label} className="rounded-2xl border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,.03)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7a8699]">{label}</p>
                      <p className="mt-4 text-3xl font-bold tracking-[-.04em] text-[#162033]">{value}</p>
                    </div>
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                      <Icon size={18} />
                    </span>
                  </div>
                  <p className="mt-5 text-sm text-[#667085]">{hint}</p>
                </article>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <section className="rounded-2xl border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,.03)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7a8699]">Current assignments</p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-.04em] text-[#182230]">Verification queue</h2>
                  </div>
                  <Link href="/agent" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0759d6]">
                    View all <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="mt-5 space-y-4">
                  {assignments.length ? assignments.map((assignment) => (
                    <Link href={`/agent/properties/${assignment.id}`} key={assignment.id} className="block rounded-2xl border border-[#e9edf4] bg-[#f9fbff] p-4 transition hover:border-[#b7d1ff] hover:bg-white">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-[#1a2333]">{assignment.title}</p>
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[assignment.status] || "bg-[#eef3ff] text-[#475467]"}`}>
                              {assignment.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[#667085]">{assignment.address}</p>
                        </div>
                        <p className="text-lg font-bold text-[#1a2333]">{formatCurrency(assignment.price)}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#667085]">
                        <span className="inline-flex items-center gap-1"><Clock3 size={14} /> Last updated {formatDate(assignment.lastUpdated)}</span>
                        <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> Stage: {assignment.stage}</span>
                      </div>
                    </Link>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-[#dfe6f1] bg-[#f8fafc] p-8 text-center text-[#667085]">
                      No assignments assigned yet.
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-2xl border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,.03)]">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7a8699]">Notifications</p>
                    <ArrowRight size={16} className="text-[#6b7280]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {notifications.length ? notifications.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#edf0f5] bg-[#f9fbff] p-3">
                        <p className="text-sm font-semibold text-[#182230]">{item.title}</p>
                        <p className="mt-1 text-sm text-[#667085]">{item.message}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[.1em] text-[#8893a5]">{formatDate(item.createdAt)}</p>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-dashed border-[#e4e8ef] bg-[#f9fafb] p-4 text-sm text-[#667085]">No new notifications.</div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,.03)]">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7a8699]">Recent activity</p>
                  <div className="mt-4 space-y-3">
                    {recentActivity.length ? recentActivity.map((item) => (
                      <div key={item.id} className="flex gap-3 rounded-xl border border-[#edf0f5] bg-[#fafcff] p-3">
                        <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#0759d6]">
                          <CheckCircle2 size={15} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#182230]">{item.title}</p>
                          <p className="text-sm text-[#667085]">{item.description}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[.1em] text-[#8893a5]">{formatDate(item.occurredAt)}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl border border-dashed border-[#e4e8ef] bg-[#f9fafb] p-4 text-sm text-[#667085]">No recent activity to display.</div>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
