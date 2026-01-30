import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { request } from "../lib/apiClient.js";

export default function ResetPassword() {
  const logoImage = "/images/Logo.svg";

  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing. Please request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setOk(true);
      // чуть-чуть времени, чтобы показать успех — можно сразу navigate
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
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
          <h1 className="text-center text-[14px] font-semibold text-[#262626]">
            Create a new password
          </h1>

          <p className="mt-2 text-center text-[12px] leading-4 text-[#737373]">
            Your password must be at least 8 characters.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-4 flex flex-col items-center"
          >
            <div className="flex flex-col gap-2">
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>

            {ok && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-[#0095F6]">
                Password updated. Redirecting to login...
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
              className={`mt-4 ${buttonClass}`}
            >
              {loading ? "Saving..." : "Set new password"}
            </button>
          </form>

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
