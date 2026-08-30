"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getAgentProperties, getCurrentUser, logout } from "../../../services/auth.service";

const statusStyles = {
  PENDING: "bg-[#fff5d6] text-[#b96b00]",
  IN_PROGRESS: "bg-[#eaf2ff] text-[#0759d6]",
  PASSED: "bg-[#eafaf0] text-[#16824d]",
  FAILED: "bg-[#fff1f1] text-[#bc2d2d]",
};

function formatCurrency(value) {
  if (!value && value !== 0) return "₹0";
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

export default function AgentPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, pending: 0, completed: 0 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const meResponse = await getCurrentUser();
        const user = meResponse.data?.data?.user;

        if (!user?.roles?.includes("AGENT")) {
          await logout();
          router.push("/agent");
          return;
        }

        const response = await getAgentProperties();
        setProperties(response.data?.data?.properties || []);
        setStats(response.data?.data?.stats || { total: 0, inProgress: 0, pending: 0, completed: 0 });
      } catch (requestError) {
        const message = requestError.response?.data?.error?.message || requestError.message || "Unable to load your assigned properties.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [router]);

  const filteredProperties = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return properties;

    return properties.filter((property) =>
      `${property.title || ""} ${property.address || ""} ${property.seller || ""} ${property.propertyType || ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [properties, query]);

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-6 text-[#1b1b1d] lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-2xl border border-[#e7ecf5] bg-white p-4 shadow-[0_10px_30px_rgba(12,24,40,.04)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/agent/dashboard" className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e7ecf5] bg-[#f7f9fc] text-[#1a2333]">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#0759d6]">BlockEstate</p>
                <h1 className="text-2xl font-bold tracking-[-.04em] text-[#1a2333]">My properties</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative block min-w-[220px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8893a5]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search assigned properties"
                  className="w-full rounded-xl border border-[#e7ecf5] bg-[#f7f9fc] py-2.5 pl-9 pr-3 text-sm text-[#1a2333] outline-none placeholder:text-[#98a3b4] focus:border-[#b7d1ff]"
                />
              </label>
            </div>
          </div>
        </header>

        {error ? (
          <div className="mt-5 rounded-xl border border-[#fed6d6] bg-[#fff1f1] px-4 py-3 text-sm text-[#b42318]">
            {error}
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total assigned", value: stats.total, tone: "bg-[#edf3ff] text-[#0759d6]", Icon: Building2 },
            { label: "In progress", value: stats.inProgress, tone: "bg-[#fff4dc] text-[#b96b00]", Icon: Clock3 },
            { label: "Pending review", value: stats.pending, tone: "bg-[#eaf2ff] text-[#1d4ed8]", Icon: Sparkles },
            { label: "Completed", value: stats.completed, tone: "bg-[#eafaf0] text-[#16824d]", Icon: CheckCircle2 },
          ].map(({ label, value, tone, Icon }) => (
            <article key={label} className="rounded-2xl border border-[#e7ecf5] bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,.03)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#7a8699]">{label}</p>
                  <p className="mt-4 text-3xl font-bold tracking-[-.04em] text-[#162033]">{loading ? "—" : value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                  <Icon size={18} />
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-[#e7ecf5] bg-white p-12 text-center text-[#667085]">
              Loading assigned properties…
            </div>
          ) : filteredProperties.length ? (
            filteredProperties.map((property) => (
              <article key={property.verificationId || property.id} className="rounded-2xl border border-[#e7ecf5] bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,.03)] md:p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
                    <div className="h-24 w-full overflow-hidden rounded-2xl bg-[#edf3ff] md:w-[180px]">
                      {property.images?.[0] ? (
                        <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#0759d6]">
                          <Building2 size={28} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-[#182230]">{property.title}</h2>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[property.status] || "bg-[#eef3ff] text-[#475467]"}`}>
                          {property.statusLabel || property.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#667085]">
                        <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {property.address}</span>
                        <span className="inline-flex items-center gap-1.5"><UserRound size={14} /> {property.seller || "Owner"}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[#667085]">
                        <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} /> Updated {formatDate(property.updatedAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> {property.stage || "Verification pending"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 xl:items-end">
                    <p className="text-2xl font-bold tracking-[-.04em] text-[#182230]">{formatCurrency(property.price)}</p>
                    <div className="flex gap-2">
                      <Link href={`/agent/properties/${property.verificationId}`} className="rounded-xl border border-[#dfe4eb] bg-white px-3 py-2 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc]">
                        View details
                      </Link>
                      <Link href={`/agent/properties/${property.verificationId}`} className="rounded-xl bg-[#0759d6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#064cb9]">
                        Open workspace
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dfe6f1] bg-white p-12 text-center text-[#667085]">
              No assigned properties match your current search.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
