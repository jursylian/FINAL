import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [stats, setStats] = useState({ likes: 0, liked: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/posts/${id}`);
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
        if (mounted) {
          setError(err.message || "Unable to load the post.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadComments() {
      setCommentsLoading(true);
      setCommentError(null);
      try {
        const data = await request(`/posts/${id}/comments?limit=50`);
        if (mounted) {
          setComments(data.items || []);
          setCommentsTotal(typeof data.total === "number" ? data.total : 0);
        }
      } catch (err) {
        if (mounted) {
          setCommentError(err.message || "Unable to load comments.");
        }
      } finally {
        if (mounted) {
          setCommentsLoading(false);
        }
      }
    }

    loadPost();
    loadComments();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleToggleLike() {
    if (likeLoading) {
      return;
    }
    setLikeLoading(true);
    try {
      const data = await request(`/posts/${id}/like`, { method: "POST" });
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
    try {
      const data = await request(`/posts/${id}/comments`, {
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
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-rose-600">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-950">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <Link className="text-sm font-semibold text-slate-900" to="/">
          Back to feed
        </Link>
        <article className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          {post.image ? (
            <img
              src={post.image}
              alt={post.caption || "post"}
              className="h-80 w-full object-cover"
            />
          ) : null}
          <div className="grid gap-3 p-6">
            <div className="text-sm text-slate-500">
              @{post.authorId?.username || "unknown"}
            </div>
            {post.caption ? (
              <div className="text-base">{post.caption}</div>
            ) : null}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={likeLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  stats.liked
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {stats.liked ? "Liked" : "Like"}
              </button>
              <div className="text-sm text-slate-600">
                Likes: <span className="font-semibold">{stats.likes}</span>
              </div>
            </div>
          </div>
        </article>

        <div className="rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <h2 className="text-lg font-semibold">Comments</h2>
          <form onSubmit={handleAddComment} className="mt-4 grid gap-3">
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              rows={3}
              placeholder="Write a comment..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
            />
            {commentError ? (
              <div className="text-sm text-rose-600">{commentError}</div>
            ) : null}
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Send
            </button>
          </form>

          <div className="mt-6 grid gap-4">
            {commentsLoading ? <div>Loading comments...</div> : null}
            {!commentsLoading && comments.length === 0 ? (
              <div className="text-sm text-slate-600">No comments yet.</div>
            ) : null}
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
                  {comment.userId?.avatar ? (
                    <img
                      src={comment.userId.avatar}
                      alt={comment.userId.username}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    @{comment.userId?.username || "unknown"}
                  </div>
                  <div className="text-sm text-slate-700">{comment.text}</div>
                </div>
              </div>
            ))}
          </div>
          {commentsTotal > comments.length ? (
            <div className="mt-4 text-xs text-slate-500">
              Showing {comments.length} of {commentsTotal}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
