import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";

export default function PostModal({ postId, onClose }) {
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
        const data = await request(`/posts/${postId}/comments?limit=50`);
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
      />
      <div className="relative z-[61] flex flex-col md:flex-row h-[90vh] md:h-[78vh] w-full md:w-[1100px] max-w-[92vw] overflow-hidden rounded-2xl bg-white text-[#262626] shadow-2xl">
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

        <div className="flex w-full md:w-[420px] flex-col border-l border-[#DBDBDB] min-h-0 flex-1">
          <div className="flex items-center gap-3 border-b border-[#DBDBDB] px-5 py-4">
            <div className="h-9 w-9 rounded-full bg-[#DBDBDB]" />
            <div className="text-sm font-semibold">
              {post?.authorId?.username || "user"}
            </div>
            <button
              type="button"
              onClick={() => setActionsOpen(true)}
              className="ml-auto text-[#8E8E8E]"
              aria-label="More options"
            >
              •••
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
            {post?.caption ? (
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-[#DBDBDB]" />
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
              <div key={comment._id} className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-[#DBDBDB]" />
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
              <div className="ml-auto text-xs text-[#8E8E8E]">
                Likes: <span className="font-semibold">{stats.likes}</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleAddComment}
            className="border-t border-[#DBDBDB] px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#DBDBDB]" />
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a comment..."
                className="h-10 flex-1 rounded-full bg-[#FAFAFA] px-4 text-sm text-[#262626] placeholder:text-[#8E8E8E] outline-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="text-sm font-semibold text-[#0095F6] disabled:opacity-60"
              >
                Post
              </button>
            </div>
            {error ? (
              <div className="mt-2 text-xs text-red-500">{error}</div>
            ) : null}
          </form>
        </div>
      </div>

      {actionsOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <button
            type="button"
            onClick={() => setActionsOpen(false)}
            className="absolute inset-0 bg-black/50"
            aria-label="Close actions"
          />
          <div className="relative z-[71] w-[360px] max-w-[90vw] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-red-500"
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-red-500"
            >
              Unfollow
            </button>
            <button
              type="button"
              onClick={() => {
                navigate(`/post/${postId}`);
                setActionsOpen(false);
                onClose?.();
              }}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-[#262626]"
            >
              Go to post
            </button>
            <button
              type="button"
              onClick={() => setActionsOpen(false)}
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-[#262626]"
            >
              Share
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
              className="w-full border-b border-[#EFEFEF] px-6 py-4 text-sm text-[#262626]"
            >
              About this account
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
    </div>
  );
}
