import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    website: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwner = me && String(me._id) === String(id);
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );

  const avatarSrc = avatarPreview || currentAvatar || "/images/ICH.svg";

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
            website: data.user.website || "",
          });
          setCurrentAvatar(data.user.avatar || null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load profile.");
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
          website: form.website || undefined,
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
        setError("Check the fields are correct.");
      } else if (err.status === 409) {
        setError("Email or username is already taken.");
      } else if (err.status === 403) {
        setError("No permission to edit this profile.");
      } else {
        setError(err.message || "Failed to save changes.");
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
      <div className="px-4 py-10">
        <div className="mx-auto max-w-[630px] text-[14px] text-[#737373]">
          Loading...
        </div>
      </div>
    );
  }

  const bioLength = form.bio.length;

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-[630px]">
        <h1 className="text-[20px] font-semibold text-[#262626] mb-8">
          Edit profile
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* ===== Avatar section ===== */}
          <div className="flex items-center gap-4 rounded-2xl bg-[#EFEFEF] p-4">
            <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full bg-[#DBDBDB]">
              <img
                src={avatarSrc}
                alt={form.username}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-[#262626] truncate">
                {form.username}
              </div>
              {form.bio && (
                <div className="text-[14px] text-[#737373] truncate">
                  {form.bio}
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="shrink-0 rounded-lg bg-[#0095F6] px-4 py-1.5 text-[14px] font-semibold text-white hover:bg-[#1877F2] transition"
            >
              New photo
            </button>
          </div>

          {/* ===== Username ===== */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-semibold text-[#262626]">
              Username
            </label>
            <input
              name="username"
              type="text"
              value={form.username}
              onChange={updateField}
              required
              className="rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] outline-none transition focus:border-[#A8A8A8]"
            />
          </div>

          {/* ===== Website ===== */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-semibold text-[#262626]">
              Website
            </label>
            <input
              name="website"
              type="url"
              value={form.website}
              onChange={updateField}
              placeholder="https://"
              className="rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] placeholder:text-[#C7C7C7] outline-none transition focus:border-[#A8A8A8]"
            />
          </div>

          {/* ===== About ===== */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-semibold text-[#262626]">
              About
            </label>
            <textarea
              name="bio"
              rows={3}
              maxLength={150}
              value={form.bio}
              onChange={updateField}
              className="resize-none rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] outline-none transition focus:border-[#A8A8A8]"
            />
            <div className="text-right text-[12px] text-[#C7C7C7]">
              {bioLength} / 150
            </div>
          </div>

          {/* ===== Error ===== */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600">
              {error}
            </div>
          )}

          {/* ===== Submit ===== */}
          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-[268px] rounded-xl bg-[#0095F6] py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#1877F2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
