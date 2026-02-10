import React from "react";

const DEFAULT_ITEMS = [
  "Home",
  "Search",
  "Explore",
  "Messages",
  "Notifications",
  "Create",
];

export default function Footer({ items = DEFAULT_ITEMS, className = "" }) {
  const normalized = items.map((item) =>
    typeof item === "string" ? { label: item } : item,
  );

  return (
    <footer className={["w-full bg-white", className].join(" ")}>
      <div className="mx-auto flex h-[158px] w-full flex-col items-center px-4 md:px-6">
        <div className="flex h-[44px] items-center justify-center gap-8 text-[12px] text-[#737373] sm:gap-10 lg:gap-12">
          {normalized.map((item) =>
            item.onClick ? (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="text-[#737373] hover:text-[#262626] transition"
              >
                {item.label}
              </button>
            ) : (
              <span key={item.label}>{item.label}</span>
            ),
          )}
        </div>
        <div className="mt-[45px] text-center text-[12px] text-[#737373]">
          © {new Date().getFullYear()} ICHgram
        </div>
      </div>
    </footer>
  );
}
