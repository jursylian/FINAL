import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({
        email: form.email || undefined,
        username: form.username || undefined,
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 400) {
        setError("Укажите email или username и пароль.");
      } else if (err.status === 401) {
        setError("Неверный логин или пароль.");
      } else {
        setError(err.message || "Не удалось войти.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Вход</h1>
          <p className="mt-2 text-sm text-slate-600">
            Войдите в аккаунт, чтобы продолжить.
          </p>
        </div>
        <form
          className="grid gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
          noValidate
          onSubmit={handleSubmit}
        >
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="user@example.com"
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          <p className="text-xs text-slate-500">
            Можно войти по email или username.
          </p>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Username
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={updateField}
              placeholder="username"
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Пароль
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-950 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>
        <p className="text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link className="font-semibold text-slate-900" to="/register">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
