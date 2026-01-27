import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <h1 className="text-3xl font-semibold">Mini-Instagram</h1>
        <div className="grid gap-3 rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="text-sm text-slate-600">Вы вошли как:</div>
          <strong className="text-lg">{user?.username || "—"}</strong>
          <div className="text-sm text-slate-500">{user?.email}</div>
          {user?._id ? (
            <Link
              className="text-sm font-semibold text-slate-900"
              to={`/profile/${user._id}`}
            >
              Перейти в профиль
            </Link>
          ) : null}
          <button
            type="button"
            onClick={logout}
            className="mt-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
