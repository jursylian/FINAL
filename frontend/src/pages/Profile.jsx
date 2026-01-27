import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsError, setPostsError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwner = useMemo(
    () => me && profile && String(me._id) === String(profile._id),
    [me, profile]
  );

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/users/${id}`);
        if (mounted) {
          setProfile(data.user);
          if (data.stats) {
            setStats({
              posts: data.stats.posts || 0,
              followers: data.stats.followers || 0,
              following: data.stats.following || 0,
              isFollowing: Boolean(data.stats.isFollowing),
            });
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Не удалось загрузить профиль.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadPosts() {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const data = await request(`/users/${id}/posts?limit=50`);
        if (mounted) {
          setPosts(data.items || []);
          setPostsTotal(typeof data.total === "number" ? data.total : 0);
        }
      } catch (err) {
        if (mounted) {
          setPostsError(err.message || "Не удалось загрузить посты.");
        }
      } finally {
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    loadProfile();
    loadPosts();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleToggleFollow() {
    if (followLoading || isOwner) {
      return;
    }
    setFollowLoading(true);
    try {
      const data = await request(`/users/${id}/follow`, { method: "POST" });
      setStats((prev) => ({
        ...prev,
        isFollowing: Boolean(data.following),
        followers:
          typeof data.followersCount === "number"
            ? data.followersCount
            : prev.followers,
        following:
          typeof data.followingCount === "number"
            ? data.followingCount
            : prev.following,
      }));
    } catch (err) {
      setError(err.message || "Не удалось обновить подписку.");
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const postsCount = stats.posts || postsTotal || posts.length;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-200">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">
                {profile.name || profile.username}
              </h1>
              <div className="text-sm text-slate-500">@{profile.username}</div>
            </div>
            {isOwner ? (
              <Link
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                to={`/profile/${profile._id}/edit`}
              >
                Редактировать профиль
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleToggleFollow}
                disabled={followLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  stats.isFollowing
                    ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {stats.isFollowing ? "Отписаться" : "Подписаться"}
              </button>
            )}
          </div>
          {profile.bio ? (
            <p className="mt-4 text-sm text-slate-700">{profile.bio}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">{postsCount}</span>{" "}
              постов
            </div>
            <Link to={`/profile/${profile._id}/followers`}>
              <span className="font-semibold text-slate-900">
                {stats.followers}
              </span>{" "}
              подписчиков
            </Link>
            <Link to={`/profile/${profile._id}/following`}>
              <span className="font-semibold text-slate-900">
                {stats.following}
              </span>{" "}
              подписки
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Посты</h2>
          {postsLoading ? <div>Загрузка постов...</div> : null}
          {postsError ? (
            <div className="rounded-2xl bg-white p-4 text-rose-600">
              {postsError}
            </div>
          ) : null}
          {!postsLoading && !postsError && posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-slate-600">
              Пока нет постов.
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/post/${post._id}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.caption || "post"}
                    className="h-60 w-full object-cover transition group-hover:scale-105"
                  />
                ) : null}
                {post.caption ? (
                  <div className="p-4 text-sm text-slate-700">
                    {post.caption}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}