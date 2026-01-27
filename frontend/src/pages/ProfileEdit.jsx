import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwner = me && String(me._id) === String(id);
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/users/${id}`);
        if (mounted) {
          setForm({
            name: data.user.name || "",
            username: data.user.username || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
          });
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
    loadProfile();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const data = await request(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name || undefined,
          username: form.username || undefined,
          email: form.email || undefined,
          bio: form.bio || undefined,
        }),
      });

      let updatedUser = data.user;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("image", avatarFile);
        const avatarData = await request(`/users/${id}/avatar`, {
          method: "PATCH",
          body: formData,
        });
        updatedUser = avatarData.user;
      }

      if (isOwner && updatedUser) {
        updateUser(updatedUser);
      }

      navigate(`/profile/${id}`, { replace: true });
    } catch (err) {
      if (err.status === 400) {
        setError("Проверьте корректность полей.");
      } else if (err.status === 409) {
        setError("Email или username уже заняты.");
      } else if (err.status === 403) {
        setError("Нет прав для редактирования профиля.");
      } else {
        setError(err.message || "Не удалось сохранить изменения.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!loading && !isOwner) {
    return <Navigate to={`/profile/${id}`} replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Редактирование профиля</h1>
          <p className="mt-2 text-sm text-slate-500">
            Обновите основные данные и аватар.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Имя
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Username
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={updateField}
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Bio
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={updateField}
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Аватар
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              className="block text-sm text-slate-600"
            />
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="preview"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : null}
          </label>
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
}