"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../../services/auth.service";

export function PublicNav({ active = "" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((response) => setUser(response.data?.data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  function requireLogin(event) {
    if (user) return;
    event.preventDefault();
    window.alert("Login needed to use this feature.");
    router.push("/login");
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      setUser(null);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const links = [
    ["Buy", "/properties", "buy"],
    ["Sell", "/dashboard", "sell"],
    ["How It Works", "/how-it-works", "how"],
    ["Lawyers", "/lawyers", "lawyers"],
  ];
  return (
    <header className="fixed left-0 top-0 z-50 flex h-[72px] w-full items-center justify-between border-b border-[#c6c6cc] bg-[#fcf8fa]/95 px-4 shadow-sm backdrop-blur-md sm:px-6 lg:px-10">
      <div className="flex items-center gap-8">
        <Link className="font-serif text-xl font-semibold text-black" href="/">
          BlockEstate
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, href, key]) => (
            <Link
              className={`rounded-md px-3 py-3 text-sm transition ${active === key ? "font-semibold text-[#0453cd]" : "text-[#45474c] hover:bg-[#f0edee] hover:text-black"}`}
              href={href}
              onClick={key === "sell" ? requireLogin : undefined}
              key={key}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            aria-label="Saved properties"
            className="rounded-full p-2 text-[#45474c] hover:bg-[#f0edee]"
            href="/saved"
            onClick={requireLogin}
          >
            &#9825;
          </Link>
          <Link
            aria-label="Messages"
            className="rounded-full p-2 text-[#45474c] hover:bg-[#f0edee]"
            href="/dashboard/messages"
            onClick={requireLogin}
          >
            &#9993;
          </Link>
        </div>
        {checkingSession ? (
          <span className="hidden px-3 py-2 text-sm text-[#76777d] sm:block">
            Checking...
          </span>
        ) : user ? (
          <>
            <span className="hidden max-w-32 truncate px-2 text-sm font-medium text-black sm:block">
              {user.name}
            </span>
            <button
              className="rounded-md border border-[#c6c6cc] px-3 py-2 text-sm font-medium text-black hover:bg-[#f0edee] disabled:opacity-60"
              disabled={loggingOut}
              onClick={handleLogout}
              type="button"
            >
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </>
        ) : (
          <>
            <Link
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-black hover:bg-[#f0edee] sm:block"
              href="/login"
            >
              Sign In
            </Link>
            <Link
              className="rounded-md bg-[#0052cc] px-3 py-2 text-sm font-medium text-white hover:bg-[#0040a2]"
              href="/signup"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="grid grid-cols-2 gap-8 border-t border-[#c6c6cc] bg-white px-6 py-12 text-sm text-[#45474c] sm:px-10 md:grid-cols-4">
      <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
        <span className="font-serif text-xl font-semibold text-black">
          BlockEstate
        </span>
        <p>Real Estate, Verified From The Ground Up.</p>
        <p className="mt-auto pt-6">
          &copy; 2024 BlockEstate. All rights reserved.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <strong className="text-black">Platform</strong>
        <Link href="/properties">Marketplace</Link>
        <Link href="/how-it-works">Verification</Link>
        <Link href="/lawyers">Lawyers</Link>
      </div>
      <div className="flex flex-col gap-3">
        <strong className="text-black">Company</strong>
        <Link href="/about">About</Link>
        <Link href="/about">Trust</Link>
        <Link href="/about">Careers</Link>
      </div>
      <div className="flex flex-col gap-3">
        <strong className="text-black">Support</strong>
        <Link href="/about">Help Center</Link>
        <Link href="/about">Contact</Link>
        <Link href="/about">Privacy</Link>
      </div>
    </footer>
  );
}
