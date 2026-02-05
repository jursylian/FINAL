import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import { request } from "../lib/apiClient.js";
import UserAvatar from "./UserAvatar.jsx";

export default function PostCreateContent({ onClose, onCreated, showBack }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function handlePickFile(event) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl("");
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleOpenPicker() {
    inputRef.current?.click();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setError(null);
    if (!file) {
      setError("Please choose an image.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      const data = await request("/posts", {
        method: "POST",
        body: formData,
      });

      if (data?.post) {
        onCreated?.(data.post);
        window.dispatchEvent(
          new CustomEvent("post:created", { detail: data.post }),
        );
      }
      onClose?.();
    } catch (err) {
      if (err.status === 400) {
        setError("Check the image and caption.");
      } else if (err.status === 401) {
        setError("Please sign in to create a post.");
      } else {
        setError(err.message || "Unable to create a post.");
      }
    } finally {
      setSaving(false);
    }
  }

  const shareDisabled = !file || saving;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-[#DBDBDB] px-5 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[14px] text-[#262626]"
            >
              Back
            </button>
          ) : null}
          <div className="text-[14px] font-semibold text-[#262626]">
            Create new post
          </div>
        </div>
        <button
          type="submit"
          form="post-create-form"
          className={[
            "text-[14px] font-semibold text-[#0095F6] cursor-pointer",
          ].join(" ")}
        >
          Share
        </button>
      </div>

      <form
        id="post-create-form"
        onSubmit={handleSubmit}
        className="flex flex-1 w-full flex-col md:flex-row overflow-hidden"
      >
        <div className="flex flex-1 items-center justify-center bg-white">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={handleOpenPicker}
              className="flex flex-col items-center gap-4 text-center"
            >
              <img
                src="/images/Cloud.svg"
                alt="Cloud"
                className="h-33 w-33 cursor-pointer"
              />
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handlePickFile}
            className="hidden"
          />
        </div>

        <div className="hidden md:block w-px bg-[#DBDBDB] self-stretch" />

        <div className="flex w-full md:w-[340px] flex-col">
          <div className="flex items-center gap-3 px-4 py-4">
            <UserAvatar user={user} size={36} />
            <div className="text-[14px] font-semibold text-[#262626]">
              {user?.username || "user"}
            </div>
          </div>

          <div className="px-4 py-3">
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write a caption..."
              className="h-[180px] w-full resize-none text-[14px] text-[#262626] outline-none placeholder:text-[#8E8E8E]"
            />
            <button
              type="button"
              className="mt-3 inline-flex items-center text-[#8E8E8E]"
              aria-label="Emoji"
            >
              <img
                src="/images/Smile.svg"
                alt="Emoji"
                className="h-6 w-6 cursor-pointer"
              />
            </button>
            {error ? (
              <div className="mt-3 text-[12px] text-red-500">{error}</div>
            ) : null}
          </div>

          <div className="h-px bg-[#DBDBDB]" />

          <div className="px-4 py-3">
            <div className="flex h-10 items-center gap-2 rounded-full bg-[#FAFAFA] px-4 text-[14px] text-[#262626]">
              <input
                type="text"
                placeholder="Add a comment..."
                className="h-full w-full bg-transparent outline-none placeholder:text-[#8E8E8E]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
