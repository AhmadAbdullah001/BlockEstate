"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, CircleAlert, ClipboardCheck, FileText, MapPin, UserPlus, X } from "lucide-react";
import { assignAdminAgent, getAdminAgents, getAdminProperty } from "../../../../services/auth.service";

const stageNames = ["Listing submitted", "Document verification", "Physical inspection", "Legal clearance", "Final decision"];

export default function AdminPropertyPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [verification, setVerification] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [error, setError] = useState("");
  const [loadingAssign, setLoadingAssign] = useState(false);

  const verificationStages = [
    { key: "documentVerification", label: "Document verification" },
    { key: "physicalInspection", label: "Physical inspection" },
    { key: "ownershipVerification", label: "Ownership verification" },
    { key: "legalVerification", label: "Legal clearance" },
  ];

  const refreshProperty = async () => {
    if (!propertyId) return;

    try {
      const [propertyResponse, agentsResponse] = await Promise.all([
        getAdminProperty(propertyId),
        getAdminAgents(),
      ]);

      setProperty(propertyResponse.data?.data?.property || null);
      setVerification(propertyResponse.data?.data?.verification || null);
      setAgents(agentsResponse.data?.data?.agents || []);
    } catch {
      setError("Unable to load this property.");
    }
  };

  useEffect(() => {
    refreshProperty();
  }, [propertyId]);

  const complete = property?.verificationStatus === "VERIFIED";
  const assignedAgent = verification?.assignedAgent || null;
  const canAssignInspector = !assignedAgent && !complete && property?.verificationStatus !== "REJECTED";
  const liveStages = verificationStages.map((stage) => {
    const current = verification?.[stage.key];
    const status = current?.status || (assignedAgent ? "PENDING" : "PENDING");

    return {
      ...stage,
      status,
      isActive: status === "IN_PROGRESS",
      isDone: status === "PASSED",
      isBlocked: status === "FAILED",
    };
  });

  const handleAssign = async () => {
    if (!propertyId || !selectedAgentId) return;

    setLoadingAssign(true);
    setError("");

    try {
      await assignAdminAgent(propertyId, selectedAgentId);
      await refreshProperty();
      setAssignOpen(false);
      setSelectedAgentId("");
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to assign this inspector.");
    } finally {
      setLoadingAssign(false);
    }
  };

  if (error) return <main className="p-8 text-[#b42318]">{error}</main>;
  if (!property) return <main className="p-8 text-[#667085]">Loading property review…</main>;

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin/properties" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0759d6]">
          <ArrowLeft size={17} /> Properties
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0759d6]">Property verification</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#182230]">{property.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[#667085]">
              <MapPin size={16} />
              {[property.address, property.city, property.state].filter(Boolean).join(", ") || "Location pending"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`h-fit rounded-full px-3 py-1.5 text-sm font-bold ${complete ? "bg-[#e5f8ef] text-[#16824d]" : "bg-[#e8f0ff] text-[#0759d6]"}`}>
              {complete ? "Verified" : "Verification in progress"}
            </span>
            {canAssignInspector && (
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0759d6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#064cb9]"
              >
                <UserPlus size={17} /> Assign inspector
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-[#e4e8ef] bg-white p-6 shadow-[0_4px_18px_rgba(16,24,40,.035)]">
            <h2 className="text-xl font-bold text-[#273142]">Verification progress</h2>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e7ebf1]">
              <div className={`h-full rounded-full ${complete ? "w-full bg-[#22a064]" : "w-2/5 bg-[#0759d6]"}`} />
            </div>

            <div className="relative mt-9 space-y-7 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-[#dce3ed]">
              {liveStages.map((stage) => {
                const status = stage.status || "PENDING";
                const done = status === "PASSED";
                const active = status === "IN_PROGRESS";
                const blocked = status === "FAILED";
                const Icon = done ? Check : active ? ClipboardCheck : blocked ? X : FileText;

                return (
                  <div key={stage.key} className="relative z-10 flex gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white ${done ? "bg-[#22a064] text-white" : active ? "bg-[#0759d6] text-white shadow-[0_0_0_4px_#e7f0ff]" : blocked ? "bg-[#fbe3d6] text-[#b42318]" : "bg-[#eef1f5] text-[#8791a1]"}`}>
                      <Icon size={18} />
                    </span>
                    <div className={active ? "-mt-1 flex-1 rounded-xl border border-[#cfe0ff] bg-[#f5f9ff] p-4" : blocked ? "-mt-1 flex-1 rounded-xl border border-[#f9d7c6] bg-[#fff5f2] p-4" : "pt-1"}>
                      <div className="flex justify-between gap-3">
                        <h3 className="font-semibold text-[#354052]">{stage.label}</h3>
                        <span className="text-xs font-bold text-[#758093]">{done ? "Completed" : active ? "Current stage" : blocked ? "Action required" : "Pending"}</span>
                      </div>
                      <p className="mt-1 text-sm text-[#758093]">
                        {done ? "This verification stage was completed successfully." : active ? "This stage is currently in progress with the assigned inspector." : blocked ? "This stage needs attention before the property can move forward." : "This stage will begin once the assigned inspector starts the review."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_4px_18px_rgba(16,24,40,.035)]">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-[#758093]">Property details</p>
              <p className="mt-4 text-2xl font-bold tracking-[-.03em] text-[#273142]">{property.price ? `$${Number(property.price).toLocaleString()}` : "Price pending"}</p>
              <div className="mt-4 space-y-3 text-sm text-[#667085]">
                <div className="flex items-center justify-between gap-2">
                  <span>Property type</span>
                  <span className="font-semibold text-[#273142]">{property.propertyType || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Bedrooms</span>
                  <span className="font-semibold text-[#273142]">{property.bedrooms || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Bathrooms</span>
                  <span className="font-semibold text-[#273142]">{property.bathrooms || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>Area</span>
                  <span className="font-semibold text-[#273142]">{property.area ? `${property.area} sq ft` : "—"}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_4px_18px_rgba(16,24,40,.035)]">
              <p className="text-xs font-bold uppercase tracking-[.1em] text-[#758093]">Assigned inspector</p>
              {assignedAgent ? (
                <div className="mt-4 rounded-xl border border-[#dfe4eb] bg-[#f9fbff] p-4">
                  <p className="font-semibold text-[#273142]">{assignedAgent.fullName || "Inspector"}</p>
                  <p className="mt-1 text-sm text-[#667085]">{assignedAgent.city || "Location unavailable"}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-[.1em] text-[#6a7c96]">
                    Active projects: {assignedAgent.activeAssignments || 0}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-[#dfe4eb] bg-[#fafbfc] p-4 text-sm text-[#667085]">
                  No inspector assigned yet.
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_4px_18px_rgba(16,24,40,.035)]">
              <div className="flex items-center gap-2 text-[#273142]">
                <CircleAlert size={17} className="text-[#d1a51c]" />
                <p className="text-sm font-semibold">Verification notes</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#667085]">
                {verification?.notes || "No verification notes have been added yet."}
              </p>
            </section>
          </aside>
        </div>
      </div>

      {assignOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/35 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAssignOpen(false);
          }}
        >
          <section className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#dfe4eb] bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-[#e7ebf1] bg-[#fafbfc] px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#273142]">Assign inspector</h2>
                <p className="mt-1 text-sm text-[#758093]">Choose an approved agent and assign them to this property.</p>
              </div>
              <button onClick={() => setAssignOpen(false)} className="rounded-lg p-2 text-[#667085] hover:bg-[#edf1f5]" aria-label="Close assign panel">
                <X size={20} />
              </button>
            </header>

            <div className="overflow-y-auto p-6">
              <div className="space-y-3">
                {agents.length ? (
                  agents.map((agent) => {
                    const workload = agent.activeAssignments || 0;
                    const isSelected = selectedAgentId === agent._id;

                    return (
                      <label
                        key={agent._id}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                          isSelected ? "border-[#75a7f7] bg-[#f5f9ff]" : "border-[#dfe4eb] hover:border-[#b7d1ff]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="agent"
                          checked={isSelected}
                          onChange={() => setSelectedAgentId(agent._id)}
                          className="h-4 w-4 accent-[#0759d6]"
                        />
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f0ff] text-sm font-bold text-[#0759d6]">
                          {(agent.fullName || "A")
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="flex-1">
                          <strong className="block text-sm text-[#273142]">{agent.fullName}</strong>
                          <span className="text-xs text-[#758093]">
                            {agent.city || "Unknown"}{agent.state ? `, ${agent.state}` : ""} • {agent.yearsExperience || 0} yrs
                          </span>
                        </span>
                        <span className="rounded-md bg-[#e8f0ff] px-2 py-1 text-[11px] font-bold text-[#0759d6]">
                          {workload} active
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-[#dfe4eb] bg-[#fafbfc] p-4 text-sm text-[#758093]">
                    No approved inspectors available right now.
                  </div>
                )}
              </div>
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-[#e7ebf1] bg-[#fafbfc] px-6 py-4">
              <button onClick={() => setAssignOpen(false)} className="rounded-xl border border-[#dfe4eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#455063]">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedAgentId || loadingAssign}
                className="rounded-xl bg-[#0759d6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#064cb9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingAssign ? "Assigning..." : "Assign selected inspector"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}