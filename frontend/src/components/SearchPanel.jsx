import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import UserAvatar from "./UserAvatar.jsx";
import UserLink from "./UserLink.jsx";
import {
  addRecent,
  clearRecent,
  getRecent,
  removeRecent,
} from "../lib/recentSearches.js";

export default function SearchPanel() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRecent(getRecent());
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setItems([]);
      setError(null);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await request(
          `/search/users?q=${encodeURIComponent(query)}`,
        );
        setItems(data.items || []);
      } catch (err) {
        setError(err.message || "Search failed.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-[40px] w-full cursor-text rounded-[10px] border border-[#DBDBDB] bg-[#FAFAFA] px-3 pr-8 text-[14px] transition-colors hover:bg-[#F2F2F2] focus:border-[#DBDBDB] focus:bg-white focus:outline-none focus:ring-0"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" fill="#C7C7C7" />
                <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        {loading ? (
          <div className="mt-3 text-[12px] text-[#8E8E8E]">Searching...</div>
        ) : null}
        {error ? (
          <div className="mt-3 text-[12px] text-red-500">{error}</div>
        ) : null}
        {!loading && !error && items.length === 0 && q.trim() && (
          <div className="mt-3 text-[12px] text-[#8E8E8E]">No users found</div>
        )}
      </div>
      <div className="mt-4 flex-1 min-h-0 overflow-y-auto pb-[calc(2.5rem+env(safe-area-inset-bottom))] scrollbar-rounded">
        <div className="flex flex-col gap-3">
          {!q.trim() ? (
            <>
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-semibold text-[#262626]">
                  Recent
                </div>
                {recent.length ? (
                  <button
                    type="button"
                    onClick={() => setRecent(clearRecent())}
                    className="text-[12px] text-[#0095F6] hover:opacity-70"
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
              {recent.length === 0 ? (
                <div className="text-[12px] text-[#8E8E8E]">
                  No recent searches.
                </div>
              ) : null}
              {recent.map((u) => (
                <div
                  key={u.userId}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setRecent(addRecent(u));
                    navigate(`/profile/${u.userId}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setRecent(addRecent(u));
                      navigate(`/profile/${u.userId}`);
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <UserLink
                    userId={u.userId}
                    ariaLabel="Open profile"
                  >
                    <UserAvatar
                      user={{ _id: u.userId, avatar: u.avatarUrl }}
                      size={40}
                    />
                  </UserLink>
                  <div className="flex-1">
                    <UserLink
                      userId={u.userId}
                      className="text-[13px] font-semibold text-[#262626]"
                      ariaLabel="Open profile"
                    >
                      {u.username}
                    </UserLink>
                    <div className="text-[12px] text-[#8E8E8E]">
                      {u.displayName || ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setRecent(removeRecent(u.userId));
                    }}
                    className="cursor-pointer text-[12px] text-[#8E8E8E] hover:text-[#262626]"
                    aria-label="Remove from recent"
                  >
                    ×
                  </button>
                </div>
              ))}
            </>
          ) : (
            items.map((u) => (
              <div
                key={u._id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  const next = addRecent({
                    userId: u._id,
                    username: u.username,
                    avatarUrl: u.avatar,
                    displayName: u.name || "",
                  });
                  setRecent(next);
                  navigate(`/profile/${u._id}`);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    const next = addRecent({
                      userId: u._id,
                      username: u.username,
                      avatarUrl: u.avatar,
                      displayName: u.name || "",
                    });
                    setRecent(next);
                    navigate(`/profile/${u._id}`);
                  }
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <UserLink userId={u._id} ariaLabel="Open profile">
                  <UserAvatar user={u} size={40} />
                </UserLink>
                <div>
                  <UserLink
                    userId={u._id}
                    className="text-[13px] font-semibold text-[#262626]"
                    ariaLabel="Open profile"
                  >
                    {u.username}
                  </UserLink>
                  <div className="text-[12px] text-[#8E8E8E]">{u.name || ""}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
