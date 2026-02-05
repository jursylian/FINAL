import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";

export default function ProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, updateUser } = useAuth();
  const fileRef = useRef(null);

  const [avatarFile, setAvatarFile] = useState(null);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      website: "",
    },
  });

  const isOwner = me && String(me._id) === String(id);
  const avatarPreview = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : null),
    [avatarFile]
  );

  const avatarSrc = avatarPreview || currentAvatar || "/images/ICH.svg";
  const watchedUsername = watch("username");
  const watchedBio = watch("bio");

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      clearErrors("root");
      try {
        const data = await request(`/users/${id}`);
        if (mounted) {
          reset({
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
          setError("root", { message: err.message || "Failed to load profile." });
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

  async function onSubmit(values) {
    try {
      const data = await request(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: values.name || undefined,
          username: values.username || undefined,
          email: values.email || undefined,
          bio: values.bio || undefined,
          website: values.website || undefined,
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
        setError("root", { message: "Check the fields are correct." });
      } else if (err.status === 409) {
        setError("root", { message: "Email or username is already taken." });
      } else if (err.status === 403) {
        setError("root", { message: "No permission to edit this profile." });
      } else {
        setError("root", { message: err.message || "Failed to save changes." });
      }
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

  const bioLength = (watchedBio || "").length;

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-[630px]">
        <h1 className="text-[20px] font-semibold text-[#262626] mb-8">
          Edit profile
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* ===== Avatar section ===== */}
          <div className="flex items-center gap-4 rounded-2xl bg-[#EFEFEF] p-4">
            <div className="h-[56px] w-[56px] shrink-0 overflow-hidden rounded-full bg-[#DBDBDB]">
              <img
                src={avatarSrc}
                alt={watchedUsername || "profile"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-[#262626] truncate">
                {watchedUsername || "profile"}
              </div>
              {watchedBio && (
                <div className="text-[14px] text-[#737373] truncate">
                  {watchedBio}
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
              type="text"
              {...register("username", {
                required: "Username is required.",
                minLength: { value: 3, message: "Min 3 characters." },
                maxLength: { value: 30, message: "Max 30 characters." },
              })}
              className="rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] outline-none transition focus:border-[#A8A8A8]"
            />
            {errors.username?.message && (
              <div className="text-[12px] text-red-500">
                {errors.username.message}
              </div>
            )}
          </div>

          {/* ===== Website ===== */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-semibold text-[#262626]">
              Website
            </label>
            <input
              type="url"
              placeholder="https://"
              {...register("website", {
                pattern: {
                  value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i,
                  message: "Enter a valid URL.",
                },
              })}
              className="rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] placeholder:text-[#C7C7C7] outline-none transition focus:border-[#A8A8A8]"
            />
            {errors.website?.message && (
              <div className="text-[12px] text-red-500">
                {errors.website.message}
              </div>
            )}
          </div>

          {/* ===== About ===== */}
          <div className="flex flex-col gap-2">
            <label className="text-[16px] font-semibold text-[#262626]">
              About
            </label>
            <textarea
              rows={3}
              maxLength={150}
              {...register("bio", {
                maxLength: { value: 150, message: "Max 150 characters." },
              })}
              className="resize-none rounded-xl border border-[#DBDBDB] bg-white px-4 py-2.5 text-[14px] text-[#262626] outline-none transition focus:border-[#A8A8A8]"
            />
            <div className="text-right text-[12px] text-[#C7C7C7]">
              {bioLength} / 150
            </div>
            {errors.bio?.message && (
              <div className="text-[12px] text-red-500">{errors.bio.message}</div>
            )}
          </div>

          {/* ===== Error ===== */}
          {errors.root?.message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-600">
              {errors.root.message}
            </div>
          )}

          {/* ===== Submit ===== */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-[268px] rounded-xl bg-[#0095F6] py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#1877F2] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
