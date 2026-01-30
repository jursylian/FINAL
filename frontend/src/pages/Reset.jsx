import React, { useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../lib/apiClient.js";

export default function Reset() {
  const logoImage = "/images/Logo.svg";
  const lockIcon = "./images/Lock.svg";

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

  const inputClass = [
    "w-[268px] h-[38px] rounded-[3px]",
    "border border-[#DBDBDB] bg-[#FAFAFA] px-3",
    "text-[12px] text-black placeholder:text-[#737373]",
    "focus:border-[#A8A8A8] focus:bg-white focus:outline-none",
  ].join(" ");

  const buttonClass = [
    "w-[268px] h-[38px] rounded-[8px]",
    "bg-[#0095F6] text-[14px] font-semibold text-white",
    "transition hover:bg-[#1877F2] active:scale-[0.99]",
    "disabled:cursor-not-allowed disabled:opacity-60",
  ].join(" ");

  return (
    <div className="min-h-screen bg-white">
      {/* Верхняя тонкая полоса как на макете */}
      <div className="border-b border-[#DBDBDB]">
        <div className="mx-auto flex h-[60px] max-w-[935px] items-center px-4">
          <img
            src={logoImage}
            alt="Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
        <div className="w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white px-10 py-8">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <img src={lockIcon} alt="Lock" />
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
              className={inputClass}
            />

            {sent && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-[#0095F6]">
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
              disabled={loading || !identifier.trim()}
              className={`mt-3 ${buttonClass}`}
            >
              {loading ? "Sending..." : "Reset your password"}
            </button>
          </form>

          {/* OR */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#DBDBDB]" />
            <span className="text-xs font-semibold text-[#8E8E8E]">OR</span>
            <div className="h-px flex-1 bg-[#DBDBDB]" />
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-[12px] font-semibold text-[#262626] hover:underline"
            >
              Create new account
            </Link>
          </div>

          <div className="mt-6 border-t border-[#DBDBDB] pt-4 text-center">
            <Link
              to="/login"
              className="text-[12px] font-semibold text-[#262626] hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
