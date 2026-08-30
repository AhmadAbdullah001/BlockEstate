"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  Menu,
  Scale,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/verifications", label: "Verification", icon: ShieldCheck },
  { href: "/admin/inspectors", label: "Inspectors", icon: UserRound },
  { href: "/admin/lawyers", label: "Lawyers", icon: Scale },
  { href: "/admin/payments", label: "Payments", icon: WalletCards },
];

function NavItems({ closeMenu }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Admin navigation">
      {navigation.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={closeMenu}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-[#e3ecff] text-[#0759d6] shadow-[inset_0_0_0_1px_rgba(7,89,214,0.05)]"
                : "text-[#5f6673] hover:bg-[#eceff4] hover:text-[#1d2430]"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-sans text-[#1d2430]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#101828]/35 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#e4e8ef] bg-[#fbfcfe] px-4 py-6 transition-transform duration-200 lg:translate-x-0 lg:px-5 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-start justify-between px-2">
          <Link href="/admin" className="group" onClick={() => setMenuOpen(false)}>
            <p className="text-[22px] font-bold tracking-[-0.045em] text-[#111827]">BlockEstate</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a8494]">Operations hub</p>
          </Link>
          <button type="button" onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-[#687386] hover:bg-[#eef1f5] lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto"><NavItems closeMenu={() => setMenuOpen(false)} /></div>

        <div className="mt-6 border-t border-[#e7eaf0] pt-4">
         
          <div className="mt-4 flex items-center gap-3 px-2 pt-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce7fb] text-sm font-bold text-[#0759d6]">A</div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#252d3a]">Admin workspace</p><p className="text-xs text-[#7a8494]">Platform administrator</p></div>
          </div>
        </div>
      </aside>

      <div className="lg:ml-[272px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e4e8ef] bg-[#fbfcfe]/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-[#566174] hover:bg-[#edf1f7] lg:hidden" aria-label="Open menu"><Menu size={21} /></button>
            <span className="text-base font-bold tracking-[-0.025em] text-[#1d2430]">BlockEstate Ops</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <label className="relative hidden md:block">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8791a1]" />
              <input className="w-64 rounded-full border border-[#dfe4eb] bg-white py-2 pl-9 pr-4 text-sm outline-none placeholder:text-[#929bab] focus:border-[#75a7f7] focus:ring-2 focus:ring-[#dceaff]" placeholder="Search the workspace..." />
            </label>
            <button type="button" className="rounded-full p-2.5 text-[#687386] transition hover:bg-[#edf1f7]" aria-label="Notifications"><Bell size={19} /></button>
            <button type="button" className="hidden rounded-full p-2.5 text-[#687386] transition hover:bg-[#edf1f7] sm:block" aria-label="Help"><CircleHelp size={19} /></button>
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">A</div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
