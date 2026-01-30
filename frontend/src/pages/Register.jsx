import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
  const logoImage = "/images/Logo.svg";

  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    name: "",
  });

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
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        name: form.name || undefined,
      });

      // После регистрации отправляем на страницу логина.
      navigate("/login", { replace: true });
    } catch (err) {
      if (err.status === 400) {
        setError("Проверьте заполнение полей (email, username, пароль).");
      } else if (err.status === 409) {
        setError("Email или username уже заняты.");
      } else {
        setError(err.message || "Не удалось зарегистрироваться.");
      }
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center">
        <div className="w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white px-10 py-8">
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

          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex flex-col gap-2">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={updateField}
                className={inputClass}
              />

              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={updateField}
                className={inputClass}
              />

              <input
                name="username"
                type="text"
                placeholder="Username"
                value={form.username}
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
              disabled={loading}
              className={`mt-4 ${buttonClass}`}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>
        </div>

        <div className="mt-4 w-[350px] rounded-[8px] border border-[#DBDBDB] bg-white py-5 text-center text-[14px]">
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

