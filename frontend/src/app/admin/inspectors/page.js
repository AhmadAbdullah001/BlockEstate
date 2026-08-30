"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, Check, Filter, MapPin, Search, UserPlus, Users, X } from "lucide-react";
import { approveAgentApplication, getAdminAgents, getPendingAgentApplications, rejectAgentApplication } from "../../../services/auth.service";

export default function AdminInspectorsPage() {
  const [agents, setAgents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [stats, setStats] = useState({ totalAgents: 0, activeVerifications: 0, overCapacity: 0 });

  const refreshData = async () => {
    try {
      const [agentsResponse, applicationsResponse] = await Promise.all([
        getAdminAgents(),
        getPendingAgentApplications(),
      ]);
      const items = agentsResponse.data?.data?.agents || [];
      setAgents(items);
      setStats(agentsResponse.data?.data?.stats || {});
      setApplications(applicationsResponse.data?.data?.applications || []);
    } catch {
      setError("Unable to load agents from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async (application) => {
    if (!application) return;

    const inputReason = window.prompt(
      "Enter rejection reason (optional)",
      "Application does not meet the required verification criteria.",
    );

    const reason = inputReason && inputReason.trim() ? inputReason.trim() : "Application rejected.";

    try {
      await rejectAgentApplication(application._id, reason);
      setSelectedApplication(null);
      await refreshData();
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Unable to reject this application.");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredAgents = useMemo(() => {
    if (!search.trim()) return agents;
    const query = search.toLowerCase();

    return agents.filter((agent) =>
      `${agent.fullName || ""} ${agent.agencyName || ""} ${agent.city || ""} ${agent.state || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [agents, search]);

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0759d6]">Workforce operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#182230]">Agent workforce</h1>
            <p className="mt-2 text-[15px] text-[#667085]">Monitor and assign verification agents across active territories.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setFilterOpen((current) => !current)} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe4eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc]">
              <Filter size={17} /> Filter
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="mt-4 rounded-xl border border-[#dfe4eb] bg-white p-4 text-sm text-[#667085] shadow-sm">
            Filtering will be enabled when the agent-management API is available.
          </div>
        )}

        {error && <p className="mt-5 text-sm text-[#b42318]">{error}</p>}

        <section className="mt-7 rounded-2xl border border-[#e4e8ef] bg-white p-5 shadow-[0_4px_18px_rgba(16,24,40,.035)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0759d6]">Applications</p>
              <h2 className="mt-2 text-xl font-bold text-[#182230]">Pending agent approvals</h2>
            </div>
            <span className="rounded-full bg-[#e8f0ff] px-2.5 py-1 text-xs font-bold text-[#0759d6]">
              {applications.length} pending
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {applications.length ? (
              applications.map((application) => (
                <div key={application._id} className="flex flex-col gap-3 rounded-xl border border-[#dfe4eb] bg-[#fafbfc] p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-[#273142]">{application.fullName}</p>
                    <p className="text-sm text-[#667085]">{application.email} • {application.city || "Unknown city"}{application.state ? `, ${application.state}` : ""}</p>
                    <p className="mt-1 text-xs text-[#758093]">{application.yearsExperience || 0} years experience • {application.specializations?.join(", ") || "General real estate"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="rounded-lg border border-[#dfe4eb] bg-white px-3 py-2 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc]"
                    >
                      View details
                    </button>
                    <button
                      onClick={async () => {
                        await approveAgentApplication(application._id);
                        await refreshData();
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0759d6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#064cb9]"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectApplication(application)}
                      className="rounded-lg border border-[#dfe4eb] bg-white px-3 py-2 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc]"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[#dfe4eb] bg-[#fafbfc] p-4 text-sm text-[#758093]">
                No agent applications are pending review.
              </p>
            )}
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ["Total agents", stats.totalAgents || 0, Users, "text-[#556070]"],
            ["Active verifications", stats.activeVerifications || 0, BriefcaseBusiness, "text-[#0759d6]"],
            ["Over capacity", stats.overCapacity || 0, X, "text-[#c1372d]"],
          ].map(([label, value, Icon, tone]) => (
            <article key={label} className="rounded-2xl border border-[#e4e8ef] bg-white p-6 shadow-[0_4px_18px_rgba(16,24,40,.035)]">
              <div className="flex items-center gap-3 text-sm font-medium text-[#667085]">
                <Icon size={19} className={tone} />
                {label}
              </div>
              <p className="mt-5 text-4xl font-bold tracking-[-.04em] text-[#273142]">{value}</p>
            </article>
          ))}
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-white shadow-[0_4px_18px_rgba(16,24,40,.035)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="border-b border-[#e7ebf1] bg-[#fafbfc] text-[11px] uppercase tracking-[.09em] text-[#758093]">
                <tr>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Workload</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0f4]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-[#758093]">Loading agents…</td>
                  </tr>
                ) : filteredAgents.length ? (
                  filteredAgents.map((agent) => {
                    const initials = (agent.fullName || "A")
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase();

                    const workload = agent.activeAssignments || 0;
                    const status = agent.status || "ACTIVE";

                    return (
                      <tr key={agent._id} className="hover:bg-[#fafcff]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0ff] text-xs font-bold text-[#0759d6]">
                              {initials}
                            </span>
                            <div>
                              <p className="font-semibold text-[#273142]">{agent.fullName}</p>
                              <p className="mt-0.5 text-xs text-[#8791a1]">ID: {String(agent._id).slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#455063]">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={15} className="text-[#8791a1]" />
                            {agent.city || "Unknown"}{agent.state ? `, ${agent.state}` : ""}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#455063]">{agent.yearsExperience || 0} yrs</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e7ebf1]">
                              <div
                                className={`h-full rounded-full ${workload >= 4 ? "bg-[#d68122]" : "bg-[#0759d6]"}`}
                                style={{ width: `${(workload / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-[#455063]">{workload}/{agent.capacity || 5}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-bold ${
                              status === "SUSPENDED"
                                ? "bg-[#fff0ee] text-[#c1372d]"
                                : status === "INACTIVE"
                                  ? "bg-[#fff3df] text-[#a96300]"
                                  : "bg-[#e8f0ff] text-[#0759d6]"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-sm font-semibold text-[#0759d6] hover:text-[#064cb9]">View</button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-[#758093]">No agents found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selectedApplication && (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/35 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedApplication(null);
            }}
          >
            <section className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#dfe4eb] bg-white shadow-2xl">
              <header className="flex items-start justify-between border-b border-[#e7ebf1] bg-[#fafbfc] px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#273142]">Agent application details</h2>
                  <p className="mt-1 text-sm text-[#758093]">Review profile, credentials, and uploaded documents before approval.</p>
                </div>
                <button onClick={() => setSelectedApplication(null)} className="rounded-lg p-2 text-[#667085] hover:bg-[#edf1f5]" aria-label="Close details">
                  <X size={20} />
                </button>
              </header>

              <div className="grid gap-6 overflow-y-auto p-6 lg:grid-cols-[220px_1fr]">
                <div className="space-y-4">
                  {selectedApplication.profileImage ? (
                    <img src={selectedApplication.profileImage} alt={selectedApplication.fullName} className="h-52 w-full rounded-2xl object-cover border border-[#e7ebf1]" />
                  ) : (
                    <div className="flex h-52 w-full items-center justify-center rounded-2xl border border-dashed border-[#dfe4eb] bg-[#fafbfc] text-sm font-semibold text-[#758093]">
                      No profile image
                    </div>
                  )}

                  <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Identity</p>
                    <p className="mt-2 font-semibold text-[#273142]">{selectedApplication.fullName}</p>
                    <p className="mt-1 text-sm text-[#667085]">{selectedApplication.email}</p>
                    <p className="mt-1 text-sm text-[#667085]">{selectedApplication.phone || "Phone not provided"}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Agency</p>
                      <p className="mt-2 font-semibold text-[#273142]">{selectedApplication.agencyName || "Not provided"}</p>
                    </div>
                    <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">License</p>
                      <p className="mt-2 font-semibold text-[#273142]">{selectedApplication.licenseNumber || "Not provided"}</p>
                    </div>
                    <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Experience</p>
                      <p className="mt-2 font-semibold text-[#273142]">{selectedApplication.yearsExperience || 0} years</p>
                    </div>
                    <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Location</p>
                      <p className="mt-2 font-semibold text-[#273142]">{selectedApplication.city || "Unknown"}{selectedApplication.state ? `, ${selectedApplication.state}` : ""}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Current profession</p>
                    <p className="mt-2 text-sm text-[#455063]">{selectedApplication.currentProfession || "Not provided"}</p>
                  </div>

                  <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Professional experience</p>
                    <p className="mt-2 whitespace-pre-line text-sm text-[#455063]">{selectedApplication.professionalExperience || "Not provided"}</p>
                  </div>

                  <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Qualifications</p>
                    <p className="mt-2 text-sm text-[#455063]">{selectedApplication.qualifications || "Not provided"}</p>
                  </div>

                  <div className="rounded-xl border border-[#e7ebf1] bg-[#fafbfc] p-4">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Supporting documents</p>
                    <ul className="mt-3 space-y-2 text-sm text-[#455063]">
                      {selectedApplication.documents?.length ? (
                        selectedApplication.documents.map((document, index) => {
                          const docEntry = typeof document === "string"
                            ? { url: document, name: document.split("/").pop() || `Document ${index + 1}` }
                            : { url: document?.url || document?.fileUrl || document?.path || "", name: document?.name || document?.fileName || `Document ${index + 1}` };

                          const displayName = docEntry.name || `Document ${index + 1}`;

                          if (!docEntry.url) {
                            return <li key={`${displayName}-${index}`} className="rounded-lg border border-[#e7ebf1] bg-white px-3 py-2">{displayName}</li>;
                          }

                          return (
                            <li key={`${docEntry.url}-${index}`} className="rounded-lg border border-[#e7ebf1] bg-white px-3 py-2">
                              <a href={docEntry.url} target="_blank" rel="noreferrer" className="font-medium text-[#0759d6] underline underline-offset-2">
                                {displayName}
                              </a>
                            </li>
                          );
                        })
                      ) : (
                        <li className="rounded-lg border border-dashed border-[#e7ebf1] bg-white px-3 py-2 text-[#758093]">No supporting documents uploaded</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="rounded-xl border border-[#dfe4eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#455063]"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleRejectApplication(selectedApplication)}
                      className="rounded-xl border border-[#dfe4eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#455063]"
                    >
                      Reject
                    </button>
                    <button
                      onClick={async () => {
                        await approveAgentApplication(selectedApplication._id);
                        setSelectedApplication(null);
                        await refreshData();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0759d6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#064cb9]"
                    >
                      <Check size={16} /> Approve application
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}