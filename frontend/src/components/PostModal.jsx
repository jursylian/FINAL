import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import { ModalStackRoot, ModalWindow } from "./ModalShell.jsx";
import UserAvatar from "./UserAvatar.jsx";

export default function PostModal({
  postId,
  onClose,
  onDeleted,
  onEdit,
  allowMobile = false,
  focusCommentId = null,
}) {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [stats, setStats] = useState({ likes: 0, liked: false });
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    if (!postId) return;
    let mounted = true;

    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/posts/${postId}`);
        if (mounted) {
          setPost(data.post);
          if (data.stats) {
            setStats({
              likes: data.stats.likes || 0,
              liked: Boolean(data.stats.liked),
            });
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || "Unable to load the post.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadComments() {
      try {
        const data = await request(`/posts/${postId}/comments?limit=${DEFAULT_LIMIT}`);
        if (mounted) {
          setComments(data.items || []);
          setCommentsTotal(typeof data.total === "number" ? data.total : 0);
        }
      } catch (err) {
        if (mounted) {
          setCommentError(err.message || "Unable to load comments.");
        }
      }
    }

    loadPost();
    loadComments();
    return () => {
      mounted = false;
    };
  }, [postId]);

  async function handleToggleLike() {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const data = await request(`/posts/${postId}/like`, { method: "POST" });
      setStats((prev) => ({
        likes:
          typeof data.likesCount === "number" ? data.likesCount : prev.likes,
        liked: Boolean(data.liked),
      }));
    } catch (err) {
      setError(err.message || "Unable to like the post.");
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleAddComment(event) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text) {
      setCommentError("Please enter a comment.");
      return;
    }
    setCommentError(null);
    setSending(true);
    try {
      const data = await request(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentsTotal((prev) => prev + 1);
        setCommentText("");
      }
    } catch (err) {
      setCommentError(err.message || "Unable to add a comment.");
    } finally {
      setSending(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch (err) {
      setError("Unable to copy link.");
    } finally {
      setActionsOpen(false);
    }
  }

  async function handleDelete() {
    if (deleteLoading) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await request(`/posts/${postId}`, { method: "DELETE" });
      onDeleted?.(postId);
      onClose?.();
    } catch (err) {
      setError(err.message || "Unable to delete the post.");
    } finally {
      setDeleteLoading(false);
      setActionsOpen(false);
    }
  }

  function handleOverlayClose() {
    if (actionsOpen) {
      setActionsOpen(false);
      return;
    }
    onClose?.();
  }

  const commentsRef = React.useRef(null);

  useEffect(() => {
    if (!focusCommentId || !commentsRef.current) return;
    const target = commentsRef.current.querySelector(
      `[data-comment-id="${focusCommentId}"]`,
    );
    if (target) {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [focusCommentId, comments]);

  return (
    <ModalStackRoot
      open={Boolean(postId)}
      onClose={handleOverlayClose}
      allowMobile={allowMobile}
    >
      <ModalWindow preset="post" zClass="z-[91]">
        <div className="relative h-full w-full overflow-hidden text-[#262626]">
          <div className="relative flex h-full w-full flex-col md:flex-row">
            <div className="h-[40vh] md:h-auto md:flex-1 bg-black shrink-0">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-white/70">
              Loading...
            </div>
          ) : post?.image ? (
            <img
              src={post.image}
              alt={post.caption || "post"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/70">
              No image
            </div>
          )}
            </div>

            <div className="flex w-full md:w-[424px] flex-col border-l border-[#DBDBDB] min-h-0 shrink-0">
          <div className="flex items-center gap-3 border-b border-[#DBDBDB] px-5 py-4">
            <UserAvatar user={post?.authorId} size={36} />
            <div className="text-sm font-semibold">
              {post?.authorId?.username || "user"}
            </div>
            <button
              type="button"
              onClick={() => setActionsOpen(true)}
              className="ml-auto text-[#8E8E8E]"
              aria-label="More options"
            >
              ...
            </button>
          </div>

          <div
            ref={commentsRef}
            className="flex-1 space-y-4 overflow-auto px-5 py-4"
          >
            {post?.caption ? (
              <div className="flex gap-3">
                <UserAvatar user={post?.authorId} size={36} />
                <div className="text-sm text-[#262626]">
                  <span className="font-semibold">
                    {post?.authorId?.username || "user"}
                  </span>{" "}
                  {post.caption}
                </div>
              </div>
            ) : null}

            {commentError ? (
              <div className="text-xs text-red-500">{commentError}</div>
            ) : null}

            {comments.map((comment) => (
              <div
                key={comment._id}
                data-comment-id={comment._id}
                className="flex gap-3"
              >
                <UserAvatar user={comment.userId} size={36} />
                <div className="text-sm text-[#262626]">
                  <span className="font-semibold">
                    {comment.userId?.username || "user"}
                  </span>{" "}
                  {comment.text}
                </div>
              </div>
            ))}
            {commentsTotal > comments.length ? (
              <div className="text-xs text-[#8E8E8E]">
                Showing {comments.length} of {commentsTotal}
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#DBDBDB] px-5 py-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={likeLoading}
                className="disabled:opacity-60"
              >
                <img
                  src={
                    stats.liked ? "/images/Like_active.svg" : "/images/Like.svg"
                  }
                  alt="Like"
                  className="h-6 w-6 cursor-pointer"
                />
              </button>
              <img
                src="/images/Comment.svg"
                alt="Comment"
                className="h-6 w-6 cursor-pointer"
              />
            </div>
            <div className="mt-2 text-xs text-[#8E8E8E]">
              Likes: <span className="font-semibold">{stats.likes}</span>
            </div>
          </div>

            <form
            onSubmit={handleAddComment}
            className="border-t border-[#DBDBDB] px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <img src="/images/Smile.svg" alt="Emoji" />
              <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-4 text-sm text-[#262626]">
                <input
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  placeholder="Add a comment..."
                  className="h-full w-full bg-transparent outline-none placeholder:text-[#8E8E8E]"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="text-sm font-semibold text-[#0095F6] disabled:opacity-60"
              >
                Share
              </button>
            </div>
            {error ? (
              <div className="mt-2 text-xs text-red-500">{error}</div>
            ) : null}
            </form>
          </div>
        </div>
      </div>
      </ModalWindow>

      {actionsOpen ? (
        <div className="absolute inset-0 z-[92] flex items-center justify-center pointer-events-none">
          <div
            className="pointer-events-auto w-[360px] max-w-[90vw] overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm font-semibold text-red-500 disabled:opacity-60"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => {
                setActionsOpen(false);
                onClose?.();
                onEdit?.(post);
              }}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-[#262626]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                const authorId = post?.authorId?._id;
                if (authorId) {
                  navigate(`/profile/${authorId}`);
                }
                setActionsOpen(false);
                onClose?.();
              }}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-[#262626]"
            >
              Go to post
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-[#262626]"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="w-full px-6 py-4 text-sm text-[#262626]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

    </ModalStackRoot>
  );
}
