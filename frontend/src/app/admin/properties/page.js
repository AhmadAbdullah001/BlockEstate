"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { getAdminProperties } from "../../../services/auth.service";

const statusTone = (status = "") => {
  if (status === "VERIFIED" || status === "ACTIVE") return "bg-[#e7f8ef] text-[#16824d]";
  if (status === "REJECTED" || status.includes("ACTION")) return "bg-[#fff0ee] text-[#c1372d]";
  if (status === "DRAFT") return "bg-[#edf3ff] text-[#1d4ed8]";
  return "bg-[#fff4dd] text-[#a96300]";
};

const textStatus = (status) => (status || "DRAFT").replaceAll("_", " ");

const stageLabel = (status) => {
  if (status === "VERIFIED" || status === "ACTIVE") return "Complete";
  if (status === "REJECTED") return "Rejected";
  if (status === "DRAFT") return "Draft";
  if (status === "SUBMITTED" || status === "PENDING_VERIFICATION") return "Initial review";
  if (status === "UNDER_REVIEW" || status === "INSPECTION_SCHEDULED") return "In progress";
  return "Review";
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminProperties()
      .then((response) => setProperties(response.data?.data?.properties || []))
      .catch(() => setError("Unable to load properties."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      properties.filter((property) =>
        `${property.title} ${property.city || ""} ${property.state || ""} ${property.sellerName || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [properties, query],
  );

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0759d6]">Property operations</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#182230]">Properties</h1>
        <p className="mt-2 text-[15px] text-[#667085]">Monitor and manage every property and its current status.</p>

        <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#e4e8ef] bg-white p-3 shadow-[0_4px_18px_rgba(16,24,40,.035)] sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8791a1]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search properties, owners, or locations"
              className="w-full rounded-xl bg-[#f7f9fc] py-2.5 pl-10 pr-4 text-sm outline-none ring-1 ring-[#e7ebf1] focus:ring-2 focus:ring-[#b7d1ff]"
            />
          </label>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe4eb] px-4 py-2.5 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc]">
            <SlidersHorizontal size={17} /> Filters
          </button>
        </div>

        {error && <p className="mt-5 text-sm text-[#b42318]">{error}</p>}

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-white shadow-[0_4px_18px_rgba(16,24,40,.035)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead className="border-b border-[#e7ebf1] bg-[#fafbfc] text-[11px] uppercase tracking-[.09em] text-[#758093]">
                <tr>
                  <th className="px-6 py-4 font-bold">Property</th>
                  <th className="px-4 py-4 font-bold">Location</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold">Stage</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f4]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#758093]">Loading properties…</td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((property) => {
                    const currentStatus = property.currentStatus || property.verificationStatus || property.listingStatus || "DRAFT";

                    return (
                      <tr key={property._id} className="group hover:bg-[#fafcff]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#0759d6]">
                              <Building2 size={19} />
                            </div>
                            <div>
                              <Link href={`/admin/properties/${property._id}`} className="font-semibold text-[#273142] group-hover:text-[#0759d6]">
                                {property.title}
                              </Link>
                              <p className="mt-0.5 text-xs text-[#8791a1]">{property.sellerName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#667085]">{property.locationText}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(currentStatus)}`}>
                            {textStatus(currentStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-[#455063]">{stageLabel(currentStatus)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/admin/properties/${property._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#0759d6]">
                            Review <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-[#758093]">No properties match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
