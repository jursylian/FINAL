import React from "react";
import { Link } from "react-router-dom";

import NotificationsList from "../components/NotificationsList.jsx";

export default function Notifications() {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-[20px] font-semibold text-[#262626]">
          Notifications
        </h1>
        <div className="rounded-2xl border border-[#EFEFEF] bg-white p-5">
          <NotificationsList />
        </div>
      </div>
    </div>
  );
}
