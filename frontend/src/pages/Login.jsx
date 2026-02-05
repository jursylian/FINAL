import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../auth/AuthContext.jsx";
import { authInputClass, authButtonClass } from "../lib/authStyles.js";

export default function Login() {
  const heroImage = "/images/Hero.png";
  const logoImage = "/images/Logo.svg";

  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { login: "", password: "" },
  });

  async function onSubmit(data) {
    setError(null);
    try {
      await login({
        email: data.login.includes("@") ? data.login : undefined,
        username: !data.login.includes("@") ? data.login : undefined,
        password: data.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 400) setError("Enter username/email and password.");
      else if (err.status === 401) setError("Invalid login or password.");
      else setError(err.message || "Unable to sign in.");
    }
  }

  return (
    <div className="flex min-h-screen justify-center pt-[88px]">
      <div className="flex gap-8 h-max ">
        <div className="hidden md:block">
          <img
            src={heroImage}
            alt="Preview"
            className="h-[580px] w-[380px] object-contain"
          />
        </div>

        <div className="flex w-full max-w-[350px] flex-col items-center pt-4 px-4">
          <div className="w-full  border border-[#DBDBDB]  px-10 py-8">
            <div className="mb-8 flex justify-center">
              <img
                src={logoImage}
                alt="Logo"
                className="h-24 w-auto object-contain"
              />
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Username, or email"
                  {...register("login", {
                    required: "Enter username or email.",
                  })}
                  className={authInputClass}
                />

                <input
                  type="password"
                  placeholder="Password"
                  {...register("password", {
                    required: "Enter password.",
                    minLength: { value: 8, message: "Min 8 characters." },
                  })}
                  className={authInputClass}
                />
              </div>

              {(errors.login || errors.password) && (
                <div className="mt-3 w-[268px] text-center text-[12px] text-red-500">
                  {errors.login?.message || errors.password?.message}
                </div>
              )}

              {error && (
                <div className="mt-3 w-[268px] text-center text-[12px] text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 ${authButtonClass}`}
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#DBDBDB]" />
              <span className="text-xs font-semibold text-[#737373]">OR</span>
              <div className="h-px flex-1 bg-[#DBDBDB]" />
            </div>

            <div className="text-center mt-16 ">
              <Link
                to="/reset"
                className="cursor-pointer text-[12px] leading-4 font-normal text-[#00376B] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="mt-4 w-full border border-[#DBDBDB] py-5 text-center text-sm">
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
