"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Check, ChevronDown, CircleAlert, FileText, House, LoaderCircle,
  MapPin, Save, ShieldCheck, Upload,
} from "lucide-react";
import { getAgentAssignment, uploadAgentEvidence, updateAgentAssignment } from "../../../../services/auth.service";
import { getVerificationStage, readableVerificationStatus, verificationStages } from "../../../../lib/verification";

const stageLabel = (value = "") => value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not set";

function StatusPill({ status }) {
  const colors = {
    PENDING: "border-[#d9dde5] bg-[#f5f6f8] text-[#5d6877]",
    IN_PROGRESS: "border-[#b8d1ff] bg-[#eef4ff] text-[#0759d6]",
    PASSED: "border-[#bfe9d0] bg-[#ebf9f0] text-[#16824d]",
    FAILED: "border-[#fecaca] bg-[#fff1f1] text-[#b42318]",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em] ${colors[status] || colors.PENDING}`}>{readableVerificationStatus(status)}</span>;
}

export default function AgentVerificationWorkspace() {
  const { verificationId } = useParams();
  const router = useRouter();
  const fileInput = useRef(null);
  const [data, setData] = useState(null);
  const [active, setActive] = useState("documentVerification");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [issue, setIssue] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await getAgentAssignment(verificationId);
      setData(response.data?.data || null);
    } catch (requestError) {
      const status = requestError.response?.status;
      if (status === 401 || status === 403) router.replace("/agent");
      else setError(requestError.response?.data?.error?.message || "Unable to load this assignment.");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (verificationId) load(); }, [verificationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const verification = data?.verification;
  const property = verification?.property;
  const completeCount = useMemo(() => verificationStages.filter(({ key }) => getVerificationStage(verification, key).status === "PASSED").length, [verification]);
  const isComplete = completeCount === verificationStages.length;

  async function saveStage(key, status, notes, reportedIssue = "") {
    setSaving(key); setError(""); setMessage("");
    try {
      const response = await updateAgentAssignment(verificationId, { stage: key, status, notes, issue: reportedIssue });
      setData((current) => ({ ...current, verification: response.data.data.verification }));
      setIssue("");
      setMessage("Verification stage saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to save this stage.");
    } finally { setSaving(""); }
  }

  async function uploadEvidence(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSaving("evidence"); setError(""); setMessage("");
    try {
      await uploadAgentEvidence(verificationId, file);
      await load();
      setMessage("Evidence uploaded successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to upload evidence.");
    } finally {
      event.target.value = "";
      setSaving("");
    }
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#fcf8fa] text-[#475467]"><LoaderCircle className="animate-spin text-[#0759d6]" /> </main>;
  if (!verification || !property) return <main className="grid min-h-screen place-items-center bg-[#fcf8fa] p-6 text-center"><div><p className="text-lg font-bold">Assignment unavailable</p><Link className="mt-3 inline-block text-[#0759d6]" href="/agent/properties">Back to my properties</Link></div></main>;

  return <main className="min-h-screen bg-[#fcf8fa] text-[#1b1b1d]">
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#dfe2e8] bg-white/95 px-5 shadow-sm backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <Link aria-label="Back to assignments" href="/agent/properties" className="grid h-10 w-10 place-items-center rounded-full text-[#5e6674] hover:bg-[#f1f3f6]"><ArrowLeft size={20} /></Link>
        <div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#667085]">Verification workspace</p><h1 className="text-lg font-bold">Assignment #{String(verification._id).slice(-6).toUpperCase()}</h1></div>
      </div>
      <StatusPill status={verification.overallStatus} />
    </header>

    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 lg:grid-cols-12 lg:px-8">
      <aside className="space-y-6 lg:col-span-4">
        <section className="overflow-hidden rounded-xl border border-[#dfe2e8] bg-white shadow-sm">
          <div className="h-52 bg-[#edf3ff]">{property.images?.[0] ? <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[#0759d6]"><House size={42} /></div>}</div>
          <div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold tracking-tight">{property.title}</h2><StatusPill status={verification.overallStatus} /></div><p className="mt-2 flex items-center gap-1 text-sm text-[#667085]"><MapPin size={15} /> {[property.address, property.city, property.state, property.country].filter(Boolean).join(", ") || "Address pending"}</p><div className="mt-5 space-y-3 border-t border-[#e5e7eb] pt-4 text-sm"><div className="flex justify-between"><span className="text-[#667085]">Property ID</span><span className="font-semibold">#{String(property._id).slice(-6).toUpperCase()}</span></div><div className="flex justify-between"><span className="text-[#667085]">Owner</span><span className="font-semibold">{property.seller?.name || "Owner"}</span></div><div className="flex justify-between"><span className="text-[#667085]">Assigned</span><span className="font-semibold">{formatDate(verification.createdAt)}</span></div></div></div>
        </section>

        <section className="rounded-xl border border-[#dfe2e8] bg-white p-5 shadow-sm"><div className="flex items-end justify-between"><h2 className="text-lg font-bold">Verification progress</h2><span className="text-sm font-bold text-[#0759d6]">{completeCount}/{verificationStages.length} completed</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e6e8ec]"><div className="h-full rounded-full bg-[#0759d6] transition-all" style={{ width: `${(completeCount / verificationStages.length) * 100}%` }} /></div><div className="mt-5 space-y-4">{verificationStages.map(({ key, title }) => { const status = getVerificationStage(verification, key).status; return <button type="button" key={key} onClick={() => setActive(key)} className="flex w-full items-start gap-3 text-left"><span className={`mt-0.5 grid h-6 w-6 place-items-center rounded-full ${status === "PASSED" ? "bg-[#0759d6] text-white" : status === "IN_PROGRESS" ? "border-2 border-[#0759d6] bg-white" : status === "FAILED" ? "bg-[#fff1f1] text-[#b42318]" : "border border-[#c8ccd4]"}`}>{status === "PASSED" ? <Check size={14} /> : status === "FAILED" ? <CircleAlert size={14} /> : null}</span><span><span className={`block text-sm font-semibold ${active === key ? "text-[#0759d6]" : "text-[#252b36]"}`}>{title}</span><span className="text-xs text-[#747d8d]">{readableVerificationStatus(status)}</span></span></button>; })}</div></section>
      </aside>

      <section className="lg:col-span-8"><div className="mb-5"><h2 className="text-2xl font-bold tracking-tight">Verification checklist</h2><p className="mt-1 text-sm text-[#667085]">Review each stage and keep an auditable record of your decision.</p></div>{error && <p role="alert" className="mb-4 rounded-lg border border-[#fecaca] bg-[#fff1f1] p-3 text-sm text-[#b42318]">{error}</p>}{message && <p className="mb-4 rounded-lg border border-[#bfe9d0] bg-[#ebf9f0] p-3 text-sm text-[#16824d]">{message}</p>}
        <div className="space-y-3">{verificationStages.map(({ key, title, description, icon: Icon, agentEditable }) => { const stageData = getVerificationStage(verification, key); return agentEditable === false ? <SystemStageCard key={key} title={title} description={description} Icon={Icon} data={stageData} open={active === key} onOpen={() => setActive(active === key ? "" : key)} /> : <StageCard key={`${key}-${stageData.status}-${stageData.notes}`} stage={key} title={title} description={description} Icon={Icon} data={stageData} open={active === key} loading={saving === key} documents={key === "documentVerification" ? data.documents : []} onOpen={() => setActive(active === key ? "" : key)} onSave={saveStage} onUpload={() => fileInput.current?.click()} />; })}</div>
        <input ref={fileInput} className="hidden" type="file" onChange={uploadEvidence} accept="image/*,application/pdf" />
        <div className="mt-7 flex flex-col gap-3 border-t border-[#dfe2e8] pt-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Ready to finalize?</p><p className="text-sm text-[#667085]">All four stages must pass before the listing can be published.</p></div><span className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold ${isComplete ? "bg-[#eafaf0] text-[#16824d]" : "bg-[#e5e7eb] text-[#667085]"}`}><ShieldCheck size={17} /> {isComplete ? "Verification complete" : "Complete all stages"}</span></div>
      </section>
    </div>
  </main>;
}

function StageCard({ stage, title, description, Icon, data = {}, open, loading, documents, onOpen, onSave, onUpload }) {
  const [status, setStatus] = useState(data.status || "PENDING");
  const [notes, setNotes] = useState(data.notes || "");
  const [issue, setIssue] = useState("");
  return <article className="overflow-hidden rounded-xl border border-[#dfe2e8] bg-white shadow-sm"><button type="button" onClick={onOpen} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-[#fafbfc]"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#eff4ff] text-[#0759d6]"><Icon size={18} /></span><span><span className="block font-bold">{title}</span><span className="mt-0.5 block text-sm text-[#667085]">{description}</span></span></span><span className="flex items-center gap-3"><StatusPill status={data.status || "PENDING"} /><ChevronDown className={`text-[#667085] transition-transform ${open ? "rotate-180" : ""}`} size={18} /></span></button>{open && <div className="border-t border-[#e5e7eb] bg-[#fdfdfe] p-5"><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><label className="text-sm font-semibold">Stage status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-lg border border-[#cfd5df] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#0759d6]"><option value="PENDING">Pending</option><option value="IN_PROGRESS">In progress</option><option value="PASSED">Passed</option><option value="FAILED">Failed</option></select></label><label className="text-sm font-semibold">Review notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Add your review notes" className="mt-2 w-full resize-y rounded-lg border border-[#cfd5df] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#0759d6]" /></label></div>{documents.length > 0 && <div className="mt-4 space-y-2">{documents.map((document) => <a key={document._id} href={document.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg border border-[#e2e5ea] bg-white p-3 text-sm hover:border-[#b8d1ff]"><span className="flex items-center gap-2 font-medium"><FileText size={16} className="text-[#0759d6]" />{document.fileName || "Property document"}</span><span className="text-xs text-[#667085]">{document.verificationStatus}</span></a>)}</div>}{stage === "documentVerification" && <button type="button" onClick={onUpload} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#cfd5df] bg-white px-3 py-2 text-sm font-semibold hover:bg-[#f4f6f9]"><Upload size={16} /> Add evidence</button>}<div className="mt-5 flex flex-col gap-3 border-t border-[#e5e7eb] pt-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-1 gap-2"><input value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Describe an issue (optional)" className="min-w-0 flex-1 rounded-lg border border-[#cfd5df] bg-white px-3 py-2 text-sm outline-none focus:border-[#b42318]" /><button type="button" disabled={!issue.trim() || loading} onClick={() => onSave(stage, "FAILED", notes, issue)} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#b42318] hover:bg-[#fff1f1] disabled:opacity-40">Report issue</button></div><button type="button" disabled={loading} onClick={() => onSave(stage, status, notes)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0759d6] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#064cb9] disabled:opacity-60"><Save size={16} /> {loading ? "Saving…" : "Save stage"}</button></div></div>}</article>;
}

function SystemStageCard({ title, description, Icon, data = {}, open, onOpen }) {
  return <article className="overflow-hidden rounded-xl border border-[#dfe2e8] bg-white shadow-sm"><button type="button" onClick={onOpen} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-[#fafbfc]"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#eff4ff] text-[#0759d6]"><Icon size={18} /></span><span><span className="block font-bold">{title}</span><span className="mt-0.5 block text-sm text-[#667085]">{description}</span></span></span><span className="flex items-center gap-3"><StatusPill status={data.status} /><ChevronDown className={`text-[#667085] transition-transform ${open ? "rotate-180" : ""}`} size={18} /></span></button>{open && <div className="border-t border-[#e5e7eb] bg-[#fdfdfe] p-5 text-sm text-[#667085]">{data.notes || "Waiting for an approved inspector to be assigned by the platform."}</div>}</article>;
}
