"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CircleAlert, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { DashboardNav } from "../../../../components/layout/DashboardNav";
import { MediaGallery } from "../../../../components/property/MediaGallery";
import { getVerificationStage, readableVerificationStatus, verificationStages } from "../../../../lib/verification";
import { propertyService } from "../../../../services/property.service";

const formatDate = (value) => value ? new Date(value).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Not updated yet";

function statusStyle(status) {
  if (status === "PASSED") return "bg-[#0453cd] text-white";
  if (status === "FAILED") return "bg-[#fff1f1] text-[#b42318]";
  if (status === "IN_PROGRESS") return "border-2 border-[#0453cd] bg-white text-[#0453cd]";
  return "border-2 border-[#c6c6cc] bg-white text-[#76777d]";
}

export default function DashboardPropertyPage() {
  const { propertyId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function refresh(showLoader = false) {
    if (!propertyId) return;
    if (showLoader) setRefreshing(true);
    try {
      const response = await propertyService.verification(propertyId);
      setData(response.data?.data || null);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to load this property.");
    } finally {
      if (showLoader) setRefreshing(false);
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void refresh(); }, 0);
    const interval = window.setInterval(() => { void refresh(); }, 10000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initialLoad);
      window.removeEventListener("focus", onFocus);
    };
  }, [propertyId]);

  const property = data?.property;
  const verification = data?.verification;
  const completedCount = useMemo(
    () => verificationStages.filter(({ key }) => getVerificationStage(verification, key).status === "PASSED").length,
    [verification],
  );
  const activeStage = verificationStages.find(({ key }) => getVerificationStage(verification, key).status === "IN_PROGRESS");

  if (error && !property) return <main className="min-h-screen bg-[#fcf8fa] p-8 text-red-700">{error}</main>;
  if (!property) return <main className="min-h-screen bg-[#fcf8fa] p-8 text-[#45474c]">Loading property...</main>;

  const media = [...(property.images || []), ...(property.videos || [])];
  const overall = verification?.overallStatus || "PENDING";
  return <>
    <DashboardNav active="properties" />
    <main className="min-h-screen bg-[#fcf8fa] px-5 pb-12 pt-0 text-[#1b1b1d] md:px-10 md:pt-6">
      <div className="mx-auto max-w-7xl">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0453cd]" href="/dashboard/properties"><ArrowLeft size={17} /> Back to properties</Link>
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold tracking-tight md:text-4xl">Verification timeline</h1><p className="mt-2 text-[#45474c]">{property.title} · {property.city || "Location pending"}</p></div><button type="button" onClick={() => refresh(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#c6c6cc] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f6f3f4] disabled:opacity-60"><RefreshCw className={refreshing ? "animate-spin" : ""} size={16} /> Refresh progress</button></div>
        {error && <p className="mb-5 rounded-lg border border-[#fecaca] bg-[#fff1f1] px-4 py-3 text-sm text-[#b42318]">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-12"><div className="space-y-6 lg:col-span-4"><section className="overflow-hidden rounded-xl border border-[#c6c6cc] bg-white p-3 shadow-sm"><MediaGallery media={media} title={property.title} /><div className="p-2"><div className="flex items-start justify-between gap-3"><h2 className="text-2xl font-bold">${Number(property.price || 0).toLocaleString()}</h2><span className="inline-flex items-center gap-2 rounded border border-[#c6c6cc] bg-[#f6f3f4] px-2 py-1 text-xs font-semibold text-[#0453cd]"><Clock3 size={14} /> {readableVerificationStatus(overall)}</span></div><p className="mt-3 text-[#45474c]">{[property.address, property.city, property.state, property.postalCode].filter(Boolean).join(", ") || "Address pending"}</p><div className="mt-5 border-t border-[#c6c6cc] pt-4 text-sm text-[#45474c]"><p>Assigned agent: <span className="font-semibold text-[#1b1b1d]">{verification?.assignedAgent?.fullName || "Awaiting assignment"}</span></p><p className="mt-2">Last update: {formatDate(verification?.updatedAt)}</p></div></div></section><section className="flex items-center gap-3 rounded-xl border border-[#c6c6cc] bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white"><ShieldCheck size={21} /></div><div><p className="font-semibold">{completedCount}/{verificationStages.length} stages completed</p><p className="text-sm text-[#45474c]">{activeStage ? `${activeStage.title} is currently in progress.` : "Updates appear automatically every 10 seconds."}</p></div></section></div>
          <section className="rounded-xl border border-[#c6c6cc] bg-white p-5 shadow-sm md:p-8 lg:col-span-8"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">Verification steps</h2><p className="mt-1 text-sm text-[#45474c]">These stages match the agent verification workspace exactly.</p></div><span className="text-sm font-semibold text-[#0453cd]">{completedCount}/{verificationStages.length}</span></div><div className="relative pl-1 md:pl-2"><div className="absolute bottom-8 left-4 top-8 w-0.5 bg-[#e5e2e3] md:left-5" />{verificationStages.map(({ key, title, description, icon: Icon }, index) => { const stage = getVerificationStage(verification, key); const status = stage.status || "PENDING"; const active = status === "IN_PROGRESS"; return <div className={`relative z-10 flex gap-4 ${index === verificationStages.length - 1 ? "" : "mb-8"}`} key={key}><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white ${statusStyle(status)}`}>{status === "PASSED" ? <Check size={17} /> : status === "FAILED" ? <CircleAlert size={17} /> : active ? <span className="h-2.5 w-2.5 rounded-full bg-[#0453cd]" /> : <Icon size={17} />}</div><div className={active ? "-mt-2 flex-1 rounded-xl border border-[#0453cd]/30 bg-[#dce2f6]/40 p-4" : `flex-1 ${status === "PENDING" ? "opacity-60" : ""}`}><div className="flex flex-col justify-between gap-1 sm:flex-row"><h3 className={`font-semibold ${active ? "text-lg" : ""}`}>{title}</h3><span className={`text-xs font-semibold ${active ? "text-[#0453cd]" : status === "FAILED" ? "text-[#b42318]" : "text-[#76777d]"}`}>{readableVerificationStatus(status)}</span></div><p className="mt-1 text-sm leading-6 text-[#45474c]">{stage.notes || description}</p>{stage.completedAt && <p className="mt-2 text-xs text-[#667085]">Updated {formatDate(stage.completedAt)}</p>}</div></div>; })}</div>{verification?.issues?.length ? <div className="mt-7 rounded-lg border border-[#fecaca] bg-[#fff8f7] p-4"><p className="font-semibold text-[#b42318]">Action required</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#7a271a]">{verification.issues.map((issue, index) => <li key={`${issue}-${index}`}>{issue}</li>)}</ul></div> : null}</section></div>
      </div>
    </main>
  </>;
}
