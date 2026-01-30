import React from "react";
import { Link } from "react-router-dom";

import NotificationsList from "../components/NotificationsList.jsx";

export default function Notifications() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <Link className="text-sm font-semibold text-slate-900" to="/">
          ← Back to feed
        </Link>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="rounded-2xl border border-[#EFEFEF] bg-white p-5">
          <NotificationsList />
        </div>
      </div>
    </div>
  );
}
