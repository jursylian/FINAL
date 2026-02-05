import React, { useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../lib/apiClient.js";
import { authInputWideClass, authButtonWideClass } from "../lib/authStyles.js";

export default function Reset() {
  const logoImage = "/images/Logo.svg";
  const lockIcon = "/images/Lock.svg";

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSent(false);
    setLoading(true);

    try {
      if (!identifier.trim()) {
        setError("Please enter your email or username.");
        setLoading(false);
        return;
      }
      await request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier }),
      });
      setSent(true);
    } catch (err) {
      setError(err.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-[#DBDBDB]">
        <div className="flex h-[60px] items-center px-[44px]">
          <img
            src={logoImage}
            alt="Logo"
            className="h-auto w-[97px] object-contain"
          />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
        <div className="w-[390px] rounded-[3px] border border-[#DBDBDB] bg-white px-10 pt-8 pb-0">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <img src={lockIcon} alt="Lock" className="cursor-pointer" />
          </div>

          <h1 className="text-center text-[14px] font-semibold text-[#262626]">
            Trouble logging in?
          </h1>

          <p className="mt-2 text-center text-[12px] leading-4 text-[#737373]">
            Enter your email, phone, or username and we&apos;ll send you a link
            to get back into your account.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col items-center"
          >
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or Username"
              className={authInputWideClass}
            />

            {sent && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-[#34A853]">
                If the account exists, we sent a reset link.
              </div>
            )}

            {error && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-3 ${authButtonWideClass}`}
            >
              {loading ? "Sending..." : "Reset your password"}
            </button>
          </form>

          {/* OR */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#DBDBDB]" />
            <span className="text-xs font-semibold text-[#737373]">OR</span>
            <div className="h-px flex-1 bg-[#DBDBDB]" />
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-[14px] font-semibold text-[#262626] hover:underline"
            >
              Create new account
            </Link>
          </div>

          <div className="mt-6 border-t border-[#DBDBDB] -mx-10">
            <Link
              to="/login"
              className="block h-[44px] w-full rounded-b-[3px] bg-white text-center text-[14px] font-semibold leading-[44px] text-[#262626] transition hover:bg-[#FAFAFA]"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
