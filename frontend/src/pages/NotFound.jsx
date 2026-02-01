import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-[#262626]">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <Link className="text-[14px] font-semibold text-[#00376B]" to="/">
          Go to home
        </Link>
      </div>
    </div>
  );
}
