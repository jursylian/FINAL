import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import UserLink from "../components/UserLink.jsx";
import UserAvatar from "../components/UserAvatar.jsx";
import useLikeToggle from "../lib/useLikeToggle.js";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [stats, setStats] = useState({ likes: 0, liked: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [commentSending, setCommentSending] = useState(false);

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
        const data = await request(`/posts/${id}/comments?limit=${DEFAULT_LIMIT}`);
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

  const { toggle: handleToggleLike, loading: likeLoading } = useLikeToggle(id, {
    onUpdate: ({ liked, likesCount }) => {
      setStats((prev) => ({
        likes: likesCount ?? prev.likes,
        liked,
      }));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications:changed"));
      }
    },
    onError: (msg) => setError(msg),
  });

  async function handleAddComment(event) {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || commentSending) {
      if (!text) setCommentError("Please enter a comment.");
      return;
    }
    setCommentError(null);
    setCommentSending(true);
    try {
      const data = await request(`/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentsTotal((prev) => prev + 1);
        setCommentText("");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("notifications:changed"));
        }
      }
    } catch (err) {
      setCommentError(err.message || "Unable to add a comment.");
    } finally {
      setCommentSending(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-2xl text-[14px] text-[#737373]">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-2xl text-[14px] text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="px-4 py-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <article className="overflow-hidden rounded-lg border border-[#EFEFEF] bg-white">
          {post.image ? (
            <img
              src={post.image}
              alt={post.caption || "post"}
              className="h-80 w-full object-cover"
            />
          ) : null}
          <div className="grid gap-3 p-6">
            <UserLink
              userId={post.authorId?._id || post.authorId}
              className="text-[12px] text-[#8E8E8E]"
              ariaLabel="Open profile"
            >
              @{post.authorId?.username || "unknown"}
            </UserLink>
            {post.caption ? (
              <div className="text-[14px] text-[#262626]">{post.caption}</div>
            ) : null}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={likeLoading}
                className="disabled:cursor-not-allowed disabled:opacity-60"
              >
                <img
                  src={
                    stats.liked ? "/images/Like_active.svg" : "/images/Like.svg"
                  }
                  alt="Like"
                  className="h-6 w-6 cursor-pointer"
                />
              </button>
              {stats.likes > 0 ? (
                <div className="text-[14px] text-[#262626]">
                  <span className="font-semibold">{stats.likes}</span>
                </div>
              ) : null}
            </div>
          </div>
        </article>

        <div className="rounded-lg border border-[#EFEFEF] bg-white p-6">
          <h2 className="text-[16px] font-semibold text-[#262626]">Comments</h2>
          <form onSubmit={handleAddComment} className="mt-4 grid gap-3">
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              rows={3}
              placeholder="Write a comment..."
              className="rounded-lg border border-[#DBDBDB] px-4 py-3 text-[14px] text-[#262626] outline-none transition focus:border-[#A8A8A8]"
            />
            {commentError ? (
              <div className="text-[12px] text-red-500">{commentError}</div>
            ) : null}
            <button
              type="submit"
              disabled={commentSending}
              className="w-fit rounded-lg bg-[#0095F6] px-6 py-2 text-[14px] font-semibold text-white transition hover:bg-[#1877F2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {commentSending ? "Sending..." : "Send"}
            </button>
          </form>

          <div className="mt-6 grid gap-4">
            {commentsLoading ? (
              <div className="text-[14px] text-[#737373]">
                Loading comments...
              </div>
            ) : null}
            {!commentsLoading && comments.length === 0 ? (
              <div className="text-[14px] text-[#737373]">No comments yet.</div>
            ) : null}
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <UserLink
                  userId={comment.userId?._id || comment.userId}
                  ariaLabel="Open profile"
                >
                  <UserAvatar user={comment.userId} size={40} />
                </UserLink>
                <div>
                  <UserLink
                    userId={comment.userId?._id || comment.userId}
                    className="text-[14px] font-semibold text-[#262626]"
                    ariaLabel="Open profile"
                  >
                    @{comment.userId?.username || "unknown"}
                  </UserLink>
                  <div className="text-[14px] text-[#262626]">
                    {comment.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {commentsTotal > comments.length ? (
            <div className="mt-4 text-[12px] text-[#8E8E8E]">
              Showing {comments.length} of {commentsTotal}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
