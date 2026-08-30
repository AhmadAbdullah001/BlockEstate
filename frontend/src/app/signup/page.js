"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getGoogleLoginUrl, signup } from "../../services/auth.service";
import { OtpBox } from "../../components/common/OtpBox";

const villaImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCxMhNiQWxAp0nmTJ8qezx71S93YTAup3MXFBpSNwKYJkhGPhJLdyOFA5A76yHBEU2PasPpjqvXyu9YvAS0dQ3TeixVIoUx4UwPX2Fy1qiVdvgIwF-Cam8KASUFy_O7vsD9kJb9mmyiAbHc9A_C-v7jGlBOfWlxJpmezOeqTbT9rvBQDAf1eJ-32GXPZNHbqVe6hdO2Bkv5sqmLoCyo8GzMKEwI0cEFEZrZO87hPSdPRnleSnsE_AwV";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      await signup(form);
      setOtpVisible(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          "Unable to create your account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#0f172a]">
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={villaImage}
          alt="Luxury real estate"
          className="h-full w-full object-cover"
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
      <section className="relative z-10 mx-auto -mt-6 w-full max-w-md rounded-t-3xl bg-[#fbf8f1] px-6 py-10 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] sm:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="mt-2 text-base text-[#45474c]">
            One account for buying, selling, and managing properties.
          </p>
        </div>
        {!otpVisible && (
          <form className="space-y-5" onSubmit={submit}>
            {[
              ["name", "Full Name", "Jane Doe", "text"],
              ["email", "Email Address", "jane.doe@example.com", "email"],
              ["phone", "Phone Number", "+1 (555) 000-0000", "tel"],
            ].map(([name, label, placeholder, type]) => (
              <label className="block text-sm font-medium" key={name}>
                <span className="mb-2 block">{label}</span>
                <input
                  className="w-full rounded-lg border border-[#c6c6cc] bg-white px-3 py-3 outline-none focus:border-[#0f172a] focus:ring-4 focus:ring-[#0f172a]/10"
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={update}
                  required={name !== "phone"}
                />
              </label>
            ))}
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Password</span>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-[#c6c6cc] bg-white px-3 py-3 pr-14 outline-none focus:border-[#0f172a] focus:ring-4 focus:ring-[#0f172a]/10"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={update}
                  minLength={8}
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
              <span className="mt-1.5 block text-xs text-[#76777d]">
                Must be at least 8 characters
              </span>
            </label>
            <label className="block text-sm font-medium">
              <span className="mb-2 block">Confirm Password</span>
              <input
                className="w-full rounded-lg border border-[#c6c6cc] bg-white px-3 py-3 outline-none focus:border-[#0f172a] focus:ring-4 focus:ring-[#0f172a]/10"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={update}
                required
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-[#45474c]">
              <input
                className="mt-1 h-4 w-4 accent-[#0f172a]"
                type="checkbox"
                required
              />
              <span>
                I agree to the{" "}
                <a
                  className="font-medium text-[#0f172a] hover:underline"
                  href="#"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  className="font-medium text-[#0f172a] hover:underline"
                  href="#"
                >
                  Privacy Policy
                </a>
              </span>
            </label>
            {error && (
              <p
                className="rounded-md bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 py-3.5 font-semibold text-white shadow-md hover:bg-[#281809] disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Creating account..." : "Create Account"}
              <span aria-hidden="true">-&gt;</span>
            </button>
          </form>
        )}
        {otpVisible && (
          <OtpBox email={form.email} onVerified={() => router.push("/")} />
        )}
        <div className="relative my-7 flex items-center">
          <div className="w-full border-t border-[#c6c6cc]/60" />
          <span className="absolute left-1/2 -translate-x-1/2 bg-[#fbf8f1] px-4 text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
            or continue with
          </span>
        </div>
        <button
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#c6c6cc] bg-white px-4 py-3.5 font-medium text-[#0f172a] shadow-sm hover:bg-[#f0edee]"
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
          Already have an account?{" "}
          <Link
            className="font-semibold text-[#d4af37] hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
        <div className="mt-8 border-t border-[#e5e2e3] pt-5 text-center">
          <div className="text-[#d4af37]" aria-label="Five star rating">
            ★ ★ ★ ★ ★
          </div>
          <p className="mt-2 text-xs font-semibold text-[#0f172a]/70">
            Trusted by 5,000+ verified homeowners
          </p>
        </div>
      </section>
    </main>
  );
}
