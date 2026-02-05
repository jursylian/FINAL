import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";

export default function UserList({ endpoint, title, emptyText }) {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/users/${id}/${endpoint}?limit=${DEFAULT_LIMIT}`);
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || `Failed to load ${endpoint}.`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      mounted = false;
    };
  }, [id, endpoint]);

  return (
    <div className="px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <h1 className="text-[20px] font-semibold text-[#262626]">{title}</h1>

        {loading ? (
          <div className="text-[14px] text-[#737373]">Loading...</div>
        ) : null}
        {error ? <div className="text-[14px] text-red-500">{error}</div> : null}

        {!loading && !error && items.length === 0 ? (
          <div className="text-[14px] text-[#737373]">{emptyText}</div>
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
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#262626]">
                  {user.name || user.username}
                </div>
                <div className="text-[12px] text-[#8E8E8E]">
                  @{user.username}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
