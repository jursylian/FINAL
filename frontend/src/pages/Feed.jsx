import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Feed() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/posts?limit=50");
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Не удалось загрузить ленту.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadFeed();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Лента</h1>
            <p className="text-sm text-slate-600">
              Привет, {user?.username || "—"}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user?._id ? (
              <Link
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow"
                to={`/profile/${user._id}`}
              >
                Профиль
              </Link>
            ) : null}
            <Link
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              to="/posts/new"
            >
              Новый пост
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Выйти
            </button>
          </div>
        </div>

        {loading ? <div>Загрузка...</div> : null}
        {error ? (
          <div className="rounded-2xl bg-white p-4 text-rose-600">{error}</div>
        ) : null}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <article
              key={post._id}
              className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.caption || "post"}
                  className="h-72 w-full object-cover"
                />
              ) : null}
              <div className="grid gap-2 p-5">
                <div className="text-sm text-slate-500">
                  @{post.authorId?.username || "unknown"}
                </div>
                {post.caption ? (
                  <div className="text-base">{post.caption}</div>
                ) : null}
                <Link
                  to={`/post/${post._id}`}
                  className="text-sm font-semibold text-slate-900"
                >
                  Открыть пост
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
