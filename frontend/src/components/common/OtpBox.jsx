"use client";

import { useEffect, useState } from "react";
import { resendOTP, verifyEmail } from "../../services/auth.service";

export function OtpBox({ email, onVerified }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    "Verification code sent. Check your email.",
  );
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyEmail({ email: email.trim().toLowerCase(), otp });
      onVerified();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error?.message ||
          "Unable to verify your email.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError("");
    try {
      const response = await resendOTP({ email });
      setOtp("");
      setMessage(response.data.message);
      setSeconds(60);
    } catch (requestError) {
      const apiError = requestError.response?.data?.error;
      setError(apiError?.message || "Unable to resend the code.");
      if (apiError?.details?.retryAfterSeconds)
        setSeconds(apiError.details.retryAfterSeconds);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-[#0453cd]/30 bg-white/80 p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-[#0453cd]">
        Verify your email
      </h2>
      <p className="mt-2 text-sm text-[#45474c]">
        Enter the 6-digit code sent to <strong>{email}</strong>.
      </p>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded-lg border border-[#c6c6cc] px-3 py-3 text-center text-xl tracking-[0.45em] outline-none focus:border-[#0453cd] focus:ring-4 focus:ring-[#0453cd]/15"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          required
        />
        {error && (
          <p
            className="rounded bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          className="w-full rounded-lg bg-[#0453cd] px-4 py-3 font-semibold text-white disabled:opacity-60"
          disabled={loading || otp.length !== 6}
          type="submit"
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>
      </form>
      <div className="mt-4 text-center text-sm text-[#45474c]">
        {message && <p className="text-emerald-700">{message}</p>}
        <button
          className="mt-2 font-semibold text-[#0453cd] disabled:text-[#76777d]"
          disabled={resending || seconds > 0}
          onClick={resend}
          type="button"
        >
          {resending
            ? "Sending..."
            : seconds > 0
              ? `Resend code in ${seconds}s`
              : "Resend code"}
        </button>
      </div>
    </div>
  );
}
