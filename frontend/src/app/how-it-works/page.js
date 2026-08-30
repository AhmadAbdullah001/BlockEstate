import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Building2, Check, CircleDollarSign, FileSearch,
  Gavel, Handshake, Home, Landmark, MapPinned, ScanLine, Search, ShieldCheck,
  UserCheck, UsersRound,
} from "lucide-react";
import { PublicFooter, PublicNav } from "../../components/layout/PublicNav";

const sellerSteps = [
  { icon: UserCheck, title: "Create your account", text: "Use one BlockEstate account to sell, buy, and follow every update in one place." },
  { icon: Building2, title: "Add your property", text: "Share the location, price, details, photos, and ownership documents needed to start a listing." },
  { icon: CircleDollarSign, title: "Pay one verification fee", text: "The fee starts the review and covers document checks, a physical visit, and planned 3D capture." },
  { icon: UsersRound, title: "An inspector is assigned", text: "A BlockEstate professional takes ownership of the verification work and keeps the timeline updated." },
];

const verificationSteps = [
  { icon: FileSearch, title: "Documents", text: "Property records and supplied documents are reviewed." },
  { icon: UserCheck, title: "Ownership", text: "The seller, title details, and ownership history are checked." },
  { icon: Home, title: "Physical inspection", text: "The inspector visits to confirm the address, condition, and listing details." },
  { icon: Gavel, title: "Legal & financial review", text: "Potential disputes, claims, loans, dues, and legal concerns are assessed." },
];

const buyerSteps = [
  { icon: Search, title: "Discover verified homes", text: "Search by place, price, type, size, distance, and verification status." },
  { icon: BadgeCheck, title: "Review the trust record", text: "See the verified status, what was checked, and when it was last updated." },
  { icon: ScanLine, title: "Explore in 3D", text: "A planned virtual walkthrough lets buyers understand a verified home before arranging a visit." },
  { icon: Handshake, title: "Make an informed offer", text: "Buyers can contact the seller or hire a deal agent to coordinate visits and negotiation." },
];

function StepCard({ step, number, tone = "blue" }) {
  const Icon = step.icon;
  const colors = tone === "dark" ? "bg-[#182230] text-white" : "bg-[#eaf2ff] text-[#0759d6]";
  return <article className="relative rounded-2xl border border-[#dfe4eb] bg-white p-5 shadow-[0_8px_22px_rgba(16,24,40,.04)]"><span className="absolute right-5 top-5 text-xs font-bold tracking-[.12em] text-[#98a2b3]">{String(number).padStart(2, "0")}</span><span className={`grid h-11 w-11 place-items-center rounded-xl ${colors}`}><Icon size={21} /></span><h3 className="mt-5 text-lg font-bold tracking-tight text-[#182230]">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#667085]">{step.text}</p></article>;
}

export default function HowItWorksPage() {
  return <>
    <PublicNav active="how" />
    <main className="overflow-hidden bg-[#fcf8fa] pt-[72px] text-[#182230]">
      <section className="relative border-b border-[#dfe4eb] bg-[#f3f6fd] px-5 py-20 sm:px-8 lg:px-10 lg:py-28"><div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_10%_20%,#cfe0ff_0,transparent_26%),radial-gradient(circle_at_88%_35%,#dbe9ff_0,transparent_23%)]" /><div className="relative mx-auto max-w-5xl text-center"><p className="inline-flex items-center gap-2 rounded-full border border-[#bfd4ff] bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[.13em] text-[#0759d6]"><ShieldCheck size={14} /> Trust before transaction</p><h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-[-.055em] text-[#182230] sm:text-5xl lg:text-6xl">Buying or selling a property should not feel like a leap of faith.</h1><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#5f6b7a] sm:text-lg">BlockEstate brings listing, verification, property discovery, professional support, and a safer closing journey into one clear workflow.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0759d6] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#064cb9]">Get started <ArrowRight size={17} /></Link><a href="#seller-flow" className="inline-flex items-center justify-center rounded-lg border border-[#bdc6d5] bg-white px-5 py-3.5 text-sm font-bold text-[#344054] hover:bg-[#f8fafc]">See the process</a></div></div></section>

      <section className="px-5 py-16 sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl"><div className="grid gap-5 rounded-2xl border border-[#dfe4eb] bg-white p-5 shadow-sm md:grid-cols-3 md:p-7"><div className="md:col-span-1"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#0759d6]">The simple idea</p><h2 className="mt-3 text-2xl font-bold tracking-tight">One property. One visible journey.</h2></div><div className="grid gap-3 text-sm leading-6 text-[#667085] sm:grid-cols-2 md:col-span-2"><p><strong className="text-[#182230]">Sellers</strong> submit their details and can follow verification progress rather than wondering what happens next.</p><p><strong className="text-[#182230]">Buyers</strong> get a clearer view of the property, its verification record, and the people helping with the deal.</p></div></div></div></section>

      <section id="seller-flow" className="bg-white px-5 py-20 sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#0759d6]">For sellers</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">Turn a listing into a property buyers can trust.</h2><p className="mt-3 leading-7 text-[#667085]">The seller starts the process. BlockEstate keeps every step visible—from listing submission through the verification decision.</p></div><div className="relative mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{sellerSteps.map((step, index) => <StepCard key={step.title} step={step} number={index + 1} />)}</div></div></section>

      <section className="bg-[#182230] px-5 py-20 text-white sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#9fc0ff]">The verification journey</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">A real review, not just a badge.</h2><p className="mt-3 leading-7 text-[#c5cede]">An inspector works through the same stages the seller sees in their dashboard. Each result and note is attached to the property timeline.</p></div><div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm text-[#dce6f8]"><MapPinned size={16} /> On-site and records-based checks</div></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{verificationSteps.map((step, index) => <StepCard key={step.title} step={step} number={index + 1} tone="dark" />)}</div><div className="mt-8 rounded-xl border border-[#7ca8f4]/30 bg-[#234171] p-5 text-sm leading-6 text-[#e1ebff]"><strong>Possible outcomes:</strong> the property can be verified, remain in review, be flagged for attention, or fail verification. A verified status explains the completed checks; it is not a substitute for independent legal advice.</div></div></section>

      <section className="px-5 py-20 sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl"><div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#0759d6]">For buyers</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">Start with confidence, then move at your pace.</h2><p className="mt-4 leading-7 text-[#667085]">Buyers see the information that matters before they invest their time in a viewing, a negotiation, or a transaction.</p><div className="mt-7 rounded-xl border border-[#bfd4ff] bg-[#edf4ff] p-5"><p className="flex items-center gap-2 font-bold text-[#123774]"><ScanLine size={19} /> Planned 3D property walkthrough</p><p className="mt-2 text-sm leading-6 text-[#31558e]">The product brief includes a 3D scan captured during physical verification, then processed into a virtual tour. This capability is planned as the verification workflow expands.</p></div></div><div className="grid gap-4 sm:grid-cols-2">{buyerSteps.map((step, index) => <StepCard key={step.title} step={step} number={index + 1} />)}</div></div></div></section>

      <section className="border-y border-[#dfe4eb] bg-white px-5 py-20 sm:px-8 lg:px-10"><div className="mx-auto max-w-5xl text-center"><p className="text-xs font-bold uppercase tracking-[.13em] text-[#0759d6]">When both sides are ready</p><h2 className="mt-3 text-3xl font-bold tracking-[-.04em]">From interest to a safer closing.</h2><p className="mx-auto mt-3 max-w-2xl leading-7 text-[#667085]">The later transaction workflow is designed to keep negotiation, legal help, and advance payments organized instead of scattered across calls and messages.</p><div className="mt-10 grid gap-4 text-left md:grid-cols-3"><article className="rounded-xl border border-[#dfe4eb] bg-[#fcf8fa] p-5"><Handshake className="text-[#0759d6]" size={23} /><h3 className="mt-4 font-bold">1. Agree the deal</h3><p className="mt-2 text-sm leading-6 text-[#667085]">The buyer and seller agree terms, with a deal agent available for negotiation support.</p></article><article className="rounded-xl border border-[#dfe4eb] bg-[#fcf8fa] p-5"><Landmark className="text-[#0759d6]" size={23} /><h3 className="mt-4 font-bold">2. Hold the advance safely</h3><p className="mt-2 text-sm leading-6 text-[#667085]">The planned escrow flow keeps advance funds with the platform or a regulated partner until the agreed conditions are met.</p></article><article className="rounded-xl border border-[#dfe4eb] bg-[#fcf8fa] p-5"><Gavel className="text-[#0759d6]" size={23} /><h3 className="mt-4 font-bold">3. Complete the legal work</h3><p className="mt-2 text-sm leading-6 text-[#667085]">Buyers and sellers can use the planned lawyer marketplace for agreements, records, and transaction advice.</p></article></div></div></section>

      <section className="px-5 py-20 sm:px-8 lg:px-10"><div className="mx-auto max-w-5xl rounded-3xl bg-[#0759d6] px-6 py-12 text-center text-white sm:px-12"><ShieldCheck className="mx-auto" size={32} /><h2 className="mt-4 text-3xl font-bold tracking-[-.04em]">Know what you are buying. Show what you are selling.</h2><p className="mx-auto mt-4 max-w-2xl leading-7 text-[#e7f0ff]">That is the BlockEstate workflow: trust-building work happens before a transaction, and everyone can see where the property stands.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/properties" className="rounded-lg bg-white px-5 py-3 font-bold text-[#0759d6] hover:bg-[#edf4ff]">Browse properties</Link><Link href="/dashboard/properties/new" className="rounded-lg border border-white/40 px-5 py-3 font-bold text-white hover:bg-white/10">List a property</Link></div></div></section>
    </main>
    <PublicFooter />
  </>;
}
