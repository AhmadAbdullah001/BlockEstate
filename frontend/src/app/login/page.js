"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  getCurrentUser,
  getGoogleLoginUrl,
  login,
  resendOTP,
  updateLocation,
} from "../../services/auth.service";
import { OtpBox } from "../../components/common/OtpBox";

const villaImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCxMhNiQWxAp0nmTJ8qezx71S93YTAup3MXFBpSNwKYJkhGPhJLdyOFA5A76yHBEU2PasPpjqvXyu9YvAS0dQ3TeixVIoUx4UwPX2Fy1qiVdvgIwF-Cam8KASUFy_O7vsD9kJb9mmyiAbHc9A_C-v7jGlBOfWlxJpmezOeqTbT9rvBQDAf1eJ-32GXPZNHbqVe6hdO2Bkv5sqmLoCyo8GzMKEwI0cEFEZrZO87hPSdPRnleSnsE_AwV";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      const meResponse = await getCurrentUser();
      const loggedInUser = meResponse?.data?.data?.user;
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            try {
              await updateLocation({
                latitude: coords.latitude,
                longitude: coords.longitude,
              });
            } catch {
              // Ignore blocked or unavailable location updates.
            }
          },
          () => {
            // Ignore permission denied.
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }

      const roles = loggedInUser?.roles || [];
      const isAdmin = roles.includes("ADMIN") || loggedInUser?.email === "admin001@gmail.com";
      if (isAdmin) {
        router.push("/admin");
        return;
      }
      router.push("/");
    } catch (requestError) {
      const apiError = requestError.response?.data?.error;
      if (apiError?.code === "EMAIL_NOT_VERIFIED") {
        try {
          await resendOTP({ email: form.email });
          setOtpVisible(true);
        } catch (resendError) {
          setError(
            resendError.response?.data?.error?.message || apiError.message,
          );
        }
        return;
      }
      setError(apiError?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#0f172a]">
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={villaImage}
          alt="High-end modern villa at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="font-serif text-5xl font-medium tracking-tight">
            BlockEstate
          </div>
          <p className="mt-2 font-serif text-lg italic tracking-wide text-white/90">
            Institutional Ledger
          </p>
        </div>
      </div>
      <section className="relative z-10 mx-auto -mt-6 w-full max-w-md rounded-t-3xl bg-[#fcf8fa] px-6 py-10 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] sm:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold ">Welcome back</h1>
          <p className="mt-2 text-base text-[#45474c]">
            Sign in to continue to BlockEstate.
          </p>
        </div>
        {!otpVisible && (
          <form className="space-y-5" onSubmit={submit}>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Email Address</span>
              <input
                className="w-full rounded-md border border-[#c6c6cc] bg-white px-3 py-3 outline-none focus:border-[#0453cd] focus:ring-4 focus:ring-[#0453cd]/15"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Password</span>
              <div className="relative">
                <input
                  className="w-full rounded-md border border-[#c6c6cc] bg-white px-3 py-3 pr-14 outline-none focus:border-[#0453cd] focus:ring-4 focus:ring-[#0453cd]/15"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  required
                />
                <button
                  className="absolute right-3 top-3 text-xs font-semibold text-[#76777d]"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between gap-3 text-xs text-[#45474c]">
              <label className="flex items-center gap-2">
                <input
                  className="h-4 w-4 accent-[#0453cd]"
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Remember me
              </label>
              <Link
                className="font-semibold text-[#0453cd] hover:underline"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </div>
            {error && (
              <p
                className="rounded-md bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 py-3.5 font-semibold text-white shadow-md hover:bg-[#0040a2] disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign In"}
              <span aria-hidden="true">-&gt;</span>
            </button>
          </form>
        )}
        {otpVisible && (
          <OtpBox email={form.email} onVerified={() => router.push("/")} />
        )}
        <div className="relative my-7 flex items-center">
          <div className="w-full border-t border-[#e5e2e3]" />
          <span className="absolute left-1/2 -translate-x-1/2 bg-[#fcf8fa] px-4 text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
            or continue with
          </span>
        </div>
        <button
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#c6c6cc] bg-white px-4 py-3.5 font-medium text-[#0f172a] shadow-sm hover:bg-[#f6f3f4]"
          onClick={() => {
            window.location.href = getGoogleLoginUrl();
          }}
          type="button"
        >
          <span className="text-lg font-bold" aria-hidden="true">
            G
          </span>
          Continue with Google
        </button>
        <p className="mt-8 text-center text-sm text-[#45474c]">
          Don&apos;t have an account?{" "}
          <Link
            className="font-semibold text-black hover:underline"
            href="/signup"
          >
            Create account
          </Link>
        </p>
        <div className="mt-8 border-t border-[#e5e2e3] pt-5 text-center">
          <div className="text-[#d4af37]" aria-label="Five star rating">
            ★ ★ ★ ★ ★
          </div>
          <p className="mt-2 text-xs font-semibold text-[#0453cd]/70">
            Trusted by 5,000+ verified homeowners
          </p>
        </div>
      </section>
    </main>
  );
}
