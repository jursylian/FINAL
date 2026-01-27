import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

export default function Register() {
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

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        name: form.name || undefined,
      });
      navigate("/", { replace: true });
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

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div>
          <h1 className="text-3xl font-semibold">Регистрация</h1>
          <p className="mt-2 text-sm text-slate-600">
            Создайте аккаунт и начните делиться постами.
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
            Имя
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              placeholder="Ваше имя"
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
            {loading ? "Регистрируем..." : "Зарегистрироваться"}
          </button>
        </form>
        <p className="text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link className="font-semibold text-slate-900" to="/login">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
