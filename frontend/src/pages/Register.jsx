import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../auth/AuthContext.jsx";
import { authInputClass, authButtonClass } from "../lib/authStyles.js";

export default function Register() {
  const logoImage = "/images/Logo.svg";

  const navigate = useNavigate();
  const { register } = useAuth();

  const [error, setError] = useState(null);
  const {
    register: rhfRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(data) {
    setError(null);
    try {
      await register({
        email: data.email,
        username: data.username,
        password: data.password,
        name: data.name || undefined,
      });

      navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 400) {
        setError("Please fill in all required fields (email, username, password).");
      } else if (err.status === 409) {
        setError("Email or username is already taken.");
      } else {
        setError(err.message || "Unable to sign up.");
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white px-10 py-8">
          <div className="mb-3 flex justify-center">
            <img
              src={logoImage}
              alt="Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          <p className="mb-4 text-center text-[14px] font-semibold text-[#737373]">
            Sign up to see photos and videos <br /> from your friends.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center"
          >
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                {...rhfRegister("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email.",
                  },
                })}
                className={authInputClass}
              />

              <input
                type="text"
                placeholder="Full Name"
                {...rhfRegister("name", {
                  maxLength: { value: 80, message: "Max 80 characters." },
                })}
                className={authInputClass}
              />

              <input
                type="text"
                placeholder="Username"
                {...rhfRegister("username", {
                  required: "Username is required.",
                  minLength: { value: 3, message: "Min 3 characters." },
                  maxLength: { value: 30, message: "Max 30 characters." },
                })}
                className={authInputClass}
              />

              <input
                type="password"
                placeholder="Password"
                {...rhfRegister("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Min 8 characters." },
                })}
                className={authInputClass}
              />
            </div>

            {(errors.email ||
              errors.name ||
              errors.username ||
              errors.password) && (
              <div className="mt-3 w-[268px] text-center text-[12px] text-red-500">
                {errors.email?.message ||
                  errors.name?.message ||
                  errors.username?.message ||
                  errors.password?.message}
              </div>
            )}

            <p className="mt-3 w-[268px] text-center text-[12px] leading-4 text-[#737373]">
              People who use our service may have uploaded your contact
              information to Instagram.
              <span className="cursor-pointer font-semibold text-[#00376B] hover:underline">
                Learn More
              </span>
              <br />
              <br />
              By signing up, you agree to our{" "}
              <span className="cursor-pointer font-semibold text-[#00376B] hover:underline">
                Terms
              </span>
              ,{" "}
              <span className="cursor-pointer font-semibold text-[#00376B] hover:underline">
                Privacy Policy
              </span>{" "}
              and{" "}
              <span className="cursor-pointer font-semibold text-[#00376B] hover:underline">
                Cookies Policy
              </span>
              .
            </p>

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
              {isSubmitting ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>

        <div className="mt-4 w-full max-w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white py-5 text-center text-[14px]">
          Have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#0095F6] hover:text-[#1877F2]"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
