import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext.jsx";
import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import UserAvatar from "./UserAvatar.jsx";

export default function PostCreateContent({
  onClose,
  onCreated,
  onUpdated,
  showBack,
  post,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const isEditing = Boolean(post);
  const ownerId =
    post?.authorId?._id ||
    post?.authorId ||
    post?.userId?._id ||
    post?.userId ||
    post?.ownerId;
  const canEditPost =
    !isEditing ||
    (ownerId && user?._id && String(ownerId) === String(user._id));

  const [caption, setCaption] = useState(post?.caption || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(post?.image || "");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [firstCommentText, setFirstCommentText] = useState("");
  const [firstCommentError, setFirstCommentError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [commentSending, setCommentSending] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);

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

  useEffect(() => {
    if (!isEditing || !post?._id) return;
    let mounted = true;
    async function loadComments() {
      setCommentsLoading(true);
      setCommentsError(null);
      try {
        const data = await request(
          `/posts/${post._id}/comments?limit=${DEFAULT_LIMIT}`,
        );
        if (mounted) {
          setComments(data.items || []);
          setCommentsTotal(typeof data.total === "number" ? data.total : 0);
        }
      } catch (err) {
        if (mounted) {
          setCommentsError(err.message || "Unable to load comments.");
        }
      } finally {
        if (mounted) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => {
      mounted = false;
    };
  }, [isEditing, post?._id]);

  function handleOpenPicker() {
    inputRef.current?.click();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    if (isEditing && !canEditPost) {
      setError("You do not have permission to edit this post.");
      return;
    }

    setError(null);
    if (!isEditing && !file) {
      setError("Please choose an image.");
      return;
    }

    setSaving(true);
    setFirstCommentError(null);
    try {
      if (isEditing) {
        const body = { caption: caption.trim() };
        const data = await request(`/posts/${post._id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        if (data?.post) {
          onUpdated?.(data.post);
          window.dispatchEvent(
            new CustomEvent("post:updated", { detail: data.post }),
          );
        }
      } else {
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
          const commentText = firstCommentText.trim();
          if (commentText) {
            try {
              await request(`/posts/${data.post._id}/comments`, {
                method: "POST",
                body: JSON.stringify({ text: commentText }),
              });
              setFirstCommentText("");
            } catch (err) {
              setFirstCommentError("Post created, but comment failed.");
            }
          }
        }
      }
      onClose?.();
    } catch (err) {
      if (err.status === 400) {
        setError("Check the image and caption.");
      } else if (err.status === 401) {
        setError(
          isEditing
            ? "Please sign in to edit."
            : "Please sign in to create a post.",
        );
      } else {
        setError(
          err.message ||
            (isEditing ? "Unable to update post." : "Unable to create a post."),
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(event) {
    event?.preventDefault();
    if (!isEditing || commentSending) return;
    const text = commentText.trim();
    if (!text) {
      setCommentError("Please enter a comment.");
      return;
    }
    setCommentError(null);
    setCommentSending(true);
    try {
      await request(`/posts/${post._id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setComments((prev) => {
        const next = [
          {
            _id: `tmp-${Date.now()}`,
            userId: user,
            text,
          },
          ...prev,
        ];
        return next;
      });
      setCommentsTotal((prev) => prev + 1);
      setCommentText("");
    } catch (err) {
      setCommentError(err.message || "Unable to add a comment.");
    } finally {
      setCommentSending(false);
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="relative flex items-center justify-center border-b border-[#DBDBDB] px-5 py-3">
        {showBack ? (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-5 text-[14px] text-[#262626]"
          >
            Back
          </button>
        ) : null}
        <div className="text-[14px] font-semibold text-[#262626]">
          {isEditing ? "Edit post" : "Create new post"}
        </div>
        {canEditPost ? (
          <button
            type="submit"
            form="post-create-form"
            className="absolute right-5 text-[14px] font-semibold text-[#0095F6] cursor-pointer"
          >
            {isEditing ? "Done" : "Share"}
          </button>
        ) : null}
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

          <div className="px-4 py-3 border-b border-[#DBDBDB]">
            {canEditPost ? (
              <textarea
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={200}
                placeholder="Write a caption..."
                className="h-[180px] w-full resize-none text-[14px] text-[#262626] outline-none placeholder:text-[#8E8E8E]"
              />
            ) : (
              <div className="text-[14px] text-[#8E8E8E]">
                You do not have permission to edit this caption.
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="inline-flex items-center text-[#8E8E8E]"
                aria-label="Emoji"
              >
                <img
                  src="/images/Smile.svg"
                  alt="Emoji"
                  className="h-6 w-6 cursor-pointer"
                />
              </button>
              <span className="text-[12px] text-[#C7C7C7]">
                {caption.length}/200
              </span>
            </div>
            {error ? (
              <div className="mt-3 text-[12px] text-red-500">{error}</div>
            ) : null}
          </div>

          {!isEditing ? (
            <div className="px-4 py-3 border-b border-[#DBDBDB]">
              <textarea
                value={firstCommentText}
                onChange={(event) => setFirstCommentText(event.target.value)}
                maxLength={500}
                placeholder="Write a comment..."
                className="h-[120px] w-full resize-none text-[14px] text-[#262626] outline-none placeholder:text-[#8E8E8E]"
              />
              {firstCommentError ? (
                <div className="mt-2 text-[12px] text-[#8E8E8E]">
                  {firstCommentError}
                </div>
              ) : null}
            </div>
          ) : null}

          {isEditing ? (
            <div className="px-4 py-3">
              <div className="mb-3">
                {commentsLoading ? (
                  <div className="mt-2 text-[12px] text-[#8E8E8E]">
                    Loading comments...
                  </div>
                ) : null}
                {commentsError ? (
                  <div className="mt-2 text-[12px] text-red-500">
                    {commentsError}
                  </div>
                ) : null}
                {!commentsLoading && !commentsError && comments.length === 0 ? (
                  <div className="mt-2 text-[12px] text-[#8E8E8E]">
                    No comments yet.
                  </div>
                ) : null}
                {comments.length ? (
                  <div className="mt-3 flex max-h-[220px] flex-col gap-3 overflow-auto pr-1">
                    {comments.map((comment) => (
                      <div key={comment._id} className="flex gap-3">
                        <UserAvatar user={comment.userId} size={28} />
                        <div className="text-[12px] text-[#262626]">
                          <span className="font-semibold">
                            {comment.userId?.username || "user"}
                          </span>{" "}
                          {comment.text}
                        </div>
                      </div>
                    ))}
                    {commentsTotal > comments.length ? (
                      <div className="text-[11px] text-[#8E8E8E]">
                        Showing {comments.length} of {commentsTotal}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-4 text-sm text-[#262626]">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddComment(event);
                      }
                    }}
                    placeholder="Write a comment..."
                    className="h-full w-full bg-transparent outline-none placeholder:text-[#8E8E8E]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={commentSending}
                  className="text-[12px] font-semibold text-[#0095F6] disabled:opacity-60"
                >
                  Post
                </button>
              </div>
              {commentError ? (
                <div className="mt-2 text-[12px] text-red-500">
                  {commentError}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
