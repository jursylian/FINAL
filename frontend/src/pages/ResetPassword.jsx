import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { request } from "../lib/apiClient.js";

export default function ResetPassword() {
  const logoImage = "/images/Logo.svg";

  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("token") || "";
  }, [location.search]);

  const [ok, setOk] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(data) {
    if (!token) {
      setError("root", {
        message: "Reset token is missing. Please request a new link.",
      });
      return;
    }

    try {
      await request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
      });
      setOk(true);
      // brief delay to show success message
      setTimeout(() => navigate("/login", { replace: true }), 800);
    } catch (err) {
      setError("root", { message: err.message || "Unable to reset password." });
    }
  }

  const inputClass = [
    "w-[300px] h-[40px] rounded-[3px]",
    "border border-[#DBDBDB] bg-[#FAFAFA] px-3",
    "text-[12px] text-black placeholder:text-[#C7C7C7]",
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
        <div className="w-full max-w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white px-10 py-8">
          <h1 className="text-center text-[14px] font-semibold text-[#262626]">
            Create a new password
          </h1>

          <p className="mt-2 text-center text-[12px] leading-4 text-[#737373]">
            Your password must be at least 8 characters.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex flex-col items-center"
          >
            <div className="flex flex-col gap-2">
              <input
                type="password"
                placeholder="New password"
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Min 8 characters." },
                })}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                {...register("confirm", {
                  required: "Confirm your password.",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match.",
                })}
                className={inputClass}
              />
            </div>

            {(errors.password || errors.confirm) && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-red-500">
                {errors.password?.message || errors.confirm?.message}
              </div>
            )}

            {ok && (
              <div className="mt-3 w-[268px] text-center text-[14px] text-[#0095F6]">
                Password updated. Redirecting to login...
              </div>
            )}

            {errors.root?.message && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-red-500">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 ${buttonClass}`}
            >
              {isSubmitting ? "Saving..." : "Set new password"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#DBDBDB] pt-4 text-center">
            <Link
              to="/login"
              className="text-[14px] font-semibold text-[#262626] hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
