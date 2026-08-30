"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Check, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { submitAgentApplication } from "../../../services/auth.service";

const steps = [
  { id: 1, label: "Identity" },
  { id: 2, label: "Location" },
  { id: 3, label: "Experience" },
  { id: 4, label: "Credentials" },
  { id: 5, label: "Review" },
];

const defaultForm = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  country: "India",
  state: "",
  city: "",
  postalCode: "",
  serviceAreas: [],
  yearsExperience: "",
  currentProfession: "",
  professionalExperience: "",
  qualifications: "",
  specializations: [],
  agencyName: "",
  licenseNumber: "",
  password: "",
  confirmPassword: "",
  documents: [],
  profileImage: "",
};

const serviceAreaOptions = [
  "Bengaluru",
  "Hyderabad",
  "Mumbai",
  "Delhi",
  "NCR",
  "Pune",
  "Chennai",
  "Kochi",
  "Ahmedabad",
  "Jaipur",
];

const expertiseOptions = [
  "Residential",
  "Commercial",
  "Apartments",
  "Villas",
  "Land",
  "Inspection",
  "Valuation",
  "Document Review",
];

export default function AgentSignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceAreaInput, setServiceAreaInput] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("blockestate-agent-application");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setForm({ ...defaultForm, ...parsed, serviceAreas: Array.isArray(parsed.serviceAreas) ? parsed.serviceAreas : [], specializations: Array.isArray(parsed.specializations) ? parsed.specializations : [], documents: Array.isArray(parsed.documents) ? parsed.documents : [] });
    } catch {
      window.sessionStorage.removeItem("blockestate-agent-application");
    }
  }, []);

  useEffect(() => {
    if (!submitted) {
      window.sessionStorage.setItem("blockestate-agent-application", JSON.stringify(form));
    }
  }, [form, submitted]);

  const progress = useMemo(() => (step / steps.length) * 100, [step]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleSearchChip = (field, value) => {
    setForm((current) => {
      const values = current[field] || [];
      return {
        ...current,
        [field]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  };

  const addServiceArea = () => {
    const value = serviceAreaInput.trim();
    if (!value) return;

    setForm((current) => ({
      ...current,
      serviceAreas: current.serviceAreas.includes(value)
        ? current.serviceAreas
        : [...current.serviceAreas, value],
    }));
    setServiceAreaInput("");
  };

  const removeServiceArea = (value) => {
    setForm((current) => ({
      ...current,
      serviceAreas: current.serviceAreas.filter((item) => item !== value),
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.fullName || !form.email || !form.phone) {
        setError("Please complete your full name, email, and phone number.");
        return false;
      }
    }

    if (step === 2) {
      if (!form.country || !form.state || !form.city) {
        setError("Please add your country, state, and city.");
        return false;
      }
      if (!form.serviceAreas.length) {
        setError("Select at least one service area.");
        return false;
      }
    }

    if (step === 3) {
      if (!form.yearsExperience || !form.currentProfession || !form.professionalExperience) {
        setError("Please add your years of experience, profession, and professional summary.");
        return false;
      }
    }

    if (step === 4) {
      if (!form.agencyName || !form.licenseNumber) {
        setError("Please add your agency name and license number.");
        return false;
      }
      if (!form.password || form.password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, steps.length));
  };

  const prevStep = () => setStep((current) => Math.max(current - 1, 1));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        country: form.country,
        state: form.state,
        city: form.city,
        postalCode: form.postalCode,
        yearsExperience: form.yearsExperience,
        currentProfession: form.currentProfession,
        professionalExperience: form.professionalExperience,
        qualifications: form.qualifications,
        agencyName: form.agencyName,
        licenseNumber: form.licenseNumber,
        password: form.password,
        bio: form.professionalExperience,
      })) {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      }

      form.serviceAreas.forEach((area) => formData.append("serviceAreas", area));
      form.specializations.forEach((area) => formData.append("specializations", area));

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      documentFiles.forEach((file) => {
        if (file) formData.append("documents", file);
      });

      await submitAgentApplication(formData);

      window.sessionStorage.removeItem("blockestate-agent-application");
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || requestError.message || "Unable to submit your agent application right now.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = steps.find((item) => item.id === step);

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 text-[#1b1b1d] sm:px-8">
        <div className="mx-auto max-w-2xl">
          <section className="rounded-2xl border border-[#e2e7ee] bg-white p-8 shadow-[0_10px_32px_rgba(16,24,40,.05)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2ff] text-[#0759d6]">
              <ShieldCheck size={28} />
            </div>
            <p className="mt-6 text-center text-xs font-bold uppercase tracking-[.16em] text-[#0759d6]">Application submitted</p>
            <h1 className="mt-3 text-center text-3xl font-bold tracking-[-.035em] text-[#182230]">You are under review</h1>
            <p className="mt-3 text-center text-[15px] leading-6 text-[#667085]">
              Your BlockEstate agent application has been submitted successfully. The admin team will review your profile, documents, and credentials before approval.
            </p>

            <div className="mt-8 rounded-xl border border-[#dfe4eb] bg-[#f7f9fc] p-5 text-left">
              <p className="text-sm font-semibold text-[#354052]">What happens next?</p>
              <ul className="mt-3 space-y-2 text-sm text-[#667085]">
                <li>• The admin reviews your identity and professional details.</li>
                <li>• If approved, the admin confirms the application.</li>
                <li>• You receive an email and can then sign in to the Agent Portal.</li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/agent" className="inline-flex items-center justify-center rounded-xl bg-[#0759d6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#064cb9]">
                Back to Agent Portal
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-5 py-8 text-[#1b1b1d] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/agent" className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#0759d6]">
          <ArrowLeft size={17} /> Back to Agent Portal
        </Link>

        <section className="mt-8 rounded-2xl border border-[#e2e7ee] bg-white p-6 shadow-[0_10px_32px_rgba(16,24,40,.05)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0759d6]">Agent application · Step {step} of {steps.length}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-.035em] text-[#182230]">Become a BlockEstate Agent</h1>
          <p className="mt-2 text-[15px] leading-6 text-[#667085]">Complete the onboarding form and wait for admin verification before login access is enabled.</p>

          <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#e8edf4]">
            <div className="h-full rounded-full bg-[#0759d6]" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {steps.map((item) => {
              const active = item.id === step;
              const done = item.id < step;

              return (
                <div key={item.id} className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${
                      done
                        ? "border-[#0759d6] bg-[#0759d6] text-white"
                        : active
                          ? "border-[#0759d6] bg-white text-[#0759d6] ring-2 ring-[#dfeeff]"
                          : "border-[#dfe4eb] bg-[#f7f9fc] text-[#8791a1]"
                    }`}
                  >
                    {done ? <Check size={15} /> : item.id}
                  </div>
                  <span className={`mt-2 text-[11px] font-semibold ${active ? "text-[#0759d6]" : "text-[#667085]"}`}>{item.label}</span>
                </div>
              );
            })}
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-[#fecaca] bg-[#fff5f5] px-3 py-3 text-sm text-[#b42318]">
              {error}
            </div>
          )}

          <form
            onSubmit={(event) => {
              if (step === steps.length) {
                handleSubmit(event);
              } else {
                event.preventDefault();
                nextStep();
              }
            }}
            className="mt-8 space-y-6"
          >
            {step === 1 && (
              <>
                <div className="flex justify-center">
                  <label className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-[#aeb8c6] bg-[#f7f9fc] text-[#667085] hover:border-[#0759d6] hover:text-[#0759d6]">
                    {form.profileImage ? (
                      <img src={form.profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={28} />
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setProfileImageFile(file);
                        updateForm("profileImage", URL.createObjectURL(file));
                      }}
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Full name</label>
                    <input value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Enter full name" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Email address</label>
                    <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="name@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Phone number</label>
                    <input value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Date of birth</label>
                    <input type="date" value={form.dateOfBirth} onChange={(event) => updateForm("dateOfBirth", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Country</label>
                    <select value={form.country} onChange={(event) => updateForm("country", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]">
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">State / Province</label>
                    <input value={form.state} onChange={(event) => updateForm("state", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Enter state" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">City</label>
                    <input value={form.city} onChange={(event) => updateForm("city", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Primary city" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Postal code</label>
                    <input value={form.postalCode} onChange={(event) => updateForm("postalCode", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="e.g. 560001" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#354052]">Service areas</label>
                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#dfe4eb] bg-[#f9fafb] p-2">
                    {form.serviceAreas.map((area) => (
                      <button key={area} type="button" onClick={() => removeServiceArea(area)} className="inline-flex items-center gap-1 rounded-full border border-[#dfe4eb] bg-white px-2.5 py-1 text-xs font-semibold text-[#455063]">
                        {area} <span className="text-[#77839a]">×</span>
                      </button>
                    ))}
                    <input value={serviceAreaInput} onChange={(event) => setServiceAreaInput(event.target.value)} onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addServiceArea();
                      }
                    }} placeholder="Add service areas..." className="min-w-[150px] flex-1 border-0 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-[#98a3b4]" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {serviceAreaOptions.map((option) => (
                      <button key={option} type="button" onClick={() => {
                        if (!form.serviceAreas.includes(option)) {
                          updateForm("serviceAreas", [...form.serviceAreas, option]);
                        }
                      }} className="rounded-full border border-[#dfe4eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#455063] hover:border-[#99b7ff] hover:text-[#0759d6]">
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Years of experience</label>
                    <select value={form.yearsExperience} onChange={(event) => updateForm("yearsExperience", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]">
                      <option value="">Select years</option>
                      <option value="0-2">0 - 2 years</option>
                      <option value="3-5">3 - 5 years</option>
                      <option value="6-10">6 - 10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Current profession</label>
                    <input value={form.currentProfession} onChange={(event) => updateForm("currentProfession", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="e.g. Real estate consultant" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#354052]">Professional experience</label>
                  <textarea rows="4" value={form.professionalExperience} onChange={(event) => updateForm("professionalExperience", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Describe your work experience and property expertise..." />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#354052]">Qualifications / Certifications</label>
                  <textarea rows="3" value={form.qualifications} onChange={(event) => updateForm("qualifications", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Mention key certifications, degrees, or relevant training..." />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#354052]">Areas of expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {expertiseOptions.map((option) => {
                      const selected = form.specializations.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => toggleSearchChip("specializations", option)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                            selected
                              ? "border-[#0759d6] bg-[#eaf2ff] text-[#0759d6]"
                              : "border-[#dfe4eb] bg-white text-[#455063] hover:border-[#99b7ff]"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Agency name</label>
                    <input value={form.agencyName} onChange={(event) => updateForm("agencyName", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Enter agency name" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">License number</label>
                    <input value={form.licenseNumber} onChange={(event) => updateForm("licenseNumber", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="e.g. RERA-7865" />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => updateForm("password", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 pr-10 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Create a secure password" />
                      <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#354052]">Confirm password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={(event) => updateForm("confirmPassword", event.target.value)} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-3 py-3 pr-10 text-sm outline-none focus:border-[#0759d6] focus:ring-2 focus:ring-[#dfeeff]" placeholder="Re-enter password" />
                      <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#354052]">Supporting documents</label>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      "Government ID",
                      "Professional certificate",
                      "Proof of experience",
                      "Other support document",
                    ].map((label, index) => (
                      <label key={label} className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cdd5df] bg-[#fafbfc] px-4 py-5 text-center hover:border-[#0759d6]">
                        <Camera size={21} className="text-[#667085]" />
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-[#354052]">{label}</p>
                          <p className="mt-1 text-xs text-[#8791a1]">{form.documents[index] ? form.documents[index] : "Click to upload"}</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;

                            const nextFiles = [...documentFiles];
                            nextFiles[index] = file;
                            setDocumentFiles(nextFiles);

                            const nextNames = [...form.documents];
                            nextNames[index] = file.name;
                            updateForm("documents", nextNames);
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#dfe4eb] bg-[#f9fafb] p-4">
                  <h2 className="text-lg font-bold text-[#182230]">Review your application</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Identity</p>
                      <p className="mt-2 text-sm text-[#354052]">{form.fullName}</p>
                      <p className="text-sm text-[#667085]">{form.email}</p>
                      <p className="text-sm text-[#667085]">{form.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Location</p>
                      <p className="mt-2 text-sm text-[#354052]">{form.city}, {form.state}</p>
                      <p className="text-sm text-[#667085]">{form.country} • {form.postalCode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Experience</p>
                      <p className="mt-2 text-sm text-[#354052]">{form.yearsExperience} experience</p>
                      <p className="text-sm text-[#667085]">{form.currentProfession}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Credentials</p>
                      <p className="mt-2 text-sm text-[#354052]">{form.agencyName}</p>
                      <p className="text-sm text-[#667085]">License: {form.licenseNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#dfe4eb] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#758093]">Selected expertise</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.specializations.length ? form.specializations.map((item) => (
                      <span key={item} className="rounded-full bg-[#eaf2ff] px-2.5 py-1 text-xs font-semibold text-[#0759d6]">{item}</span>
                    )) : <span className="text-sm text-[#667085]">No expertise selected.</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-[#e7ebf1] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={prevStep} disabled={step === 1} className="w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                Back
              </button>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <button type="button" className="w-full rounded-xl border border-[#dfe4eb] bg-white px-4 py-3 text-sm font-semibold text-[#455063] hover:bg-[#f7f9fc] sm:w-auto">
                  Save draft
                </button>

                {step < steps.length ? (
                  <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0759d6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#064cb9] sm:w-auto">
                    Continue <ArrowRight size={18} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0759d6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#064cb9] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto">
                    {loading ? "Submitting..." : "Submit application"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
