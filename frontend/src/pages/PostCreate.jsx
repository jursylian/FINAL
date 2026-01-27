import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";

export default function PostCreate() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!file) {
        setError("Выберите изображение.");
        return;
      }
      const formData = new FormData();
      formData.append("image", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const data = await request("/posts", {
        method: "POST",
        body: formData,
      });

      navigate(`/post/${data.post._id}`, { replace: true });
    } catch (err) {
      if (err.status === 400) {
        setError("Проверьте изображение и подпись.");
      } else if (err.status === 401) {
        setError("Нужно войти в аккаунт.");
      } else {
        setError(err.message || "Не удалось создать пост.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Новый пост</h1>
          <p className="mt-2 text-sm text-slate-500">
            Загрузите изображение и добавьте подпись.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Изображение
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="block text-sm text-slate-600"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Подпись
            <textarea
              rows={4}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400"
            />
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
            {saving ? "Сохраняем..." : "Опубликовать"}
          </button>
        </form>
      </div>
    </div>
  );
}
