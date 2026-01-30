import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const heroImage = "/images/Hero.png";
  const logoImage = "/images/Logo.svg";

  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({
        email: form.login.includes("@") ? form.login : undefined,
        username: !form.login.includes("@") ? form.login : undefined,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 400) setError("Enter username/email and password.");
      else if (err.status === 401) setError("Invalid login or password.");
      else setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  // Figma sizes (inputs/buttons fixed)
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="grid w-full max-w-[935px] items-center gap-[5px] md:grid-cols-2">
        <div className="hidden justify-center md:flex">
          <img
            src={heroImage}
            alt="Preview"
            className="h-[580px] w-auto object-contain"
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white px-10 py-8">
            <div className="mb-8 flex justify-center">
              <img
                src={logoImage}
                alt="Logo"
                className="h-16 w-auto object-contain"
              />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col gap-2">
                <input
                  name="login"
                  type="text"
                  placeholder="Username, or email"
                  value={form.login}
                  onChange={updateField}
                  className={inputClass}
                />

                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={updateField}
                  className={inputClass}
                />
              </div>

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
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DBDBDB]" />
              <span className="text-xs font-semibold text-[#8E8E8E]">OR</span>
              <div className="h-px flex-1 bg-[#DBDBDB]" />
            </div>

            <div className="text-center">
              <Link
                to="/reset"
                className="cursor-pointer text-[12px] leading-4 font-normal text-[#00376B] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="mt-4 w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white py-5 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#0095F6] hover:text-[#1877F2]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
