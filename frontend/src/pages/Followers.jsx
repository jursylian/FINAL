import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";

export default function Followers() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadFollowers() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/users/${id}/followers?limit=50`);
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Не удалось загрузить подписчиков.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadFollowers();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link className="text-sm font-semibold text-slate-900" to={`/profile/${id}`}>
          Назад к профилю
        </Link>
        <h1 className="text-2xl font-semibold">Подписчики</h1>

        {loading ? <div>Загрузка...</div> : null}
        {error ? (
          <div className="rounded-2xl bg-white p-4 text-rose-600">{error}</div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-slate-600">
            Пока нет подписчиков.
          </div>
        ) : null}

        <div className="grid gap-3">
          {items.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <div className="font-semibold">
                  {user.name || user.username}
                </div>
                <div className="text-sm text-slate-500">@{user.username}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}