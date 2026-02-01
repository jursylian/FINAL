import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";

export default function Following() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadFollowing() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/users/${id}/following?limit=50`);
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load following.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadFollowing();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link className="text-[14px] font-semibold text-[#00376B]" to={`/profile/${id}`}>
          ← Back to profile
        </Link>
        <h1 className="text-[20px] font-semibold text-[#262626]">Following</h1>

        {loading ? <div className="text-[14px] text-[#737373]">Loading...</div> : null}
        {error ? (
          <div className="text-[14px] text-red-500">{error}</div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="text-[14px] text-[#737373]">Not following anyone yet.</div>
        ) : null}

        <div className="grid gap-3">
          {items.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="flex items-center gap-4 rounded-lg border border-[#EFEFEF] bg-white p-4"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full bg-[#DBDBDB]">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#262626]">
                  {user.name || user.username}
                </div>
                <div className="text-[12px] text-[#8E8E8E]">@{user.username}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
