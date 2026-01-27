import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <h1 className="text-3xl font-semibold">Страница не найдена</h1>
        <Link className="font-semibold text-slate-900" to="/">
          На главную
        </Link>
      </div>
    </div>
  );
}
