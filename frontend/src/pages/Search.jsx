import React from "react";

import SearchPanel from "../components/SearchPanel.jsx";

export default function Search() {
  return (
    <div className="px-4 py-10 flex min-h-[calc(100vh-112px)] flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 min-h-0">
        <SearchPanel />
      </div>
    </div>
  );
}
