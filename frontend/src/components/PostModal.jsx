import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import { ModalStackRoot, ModalWindow } from "./ModalShell.jsx";
import UserAvatar from "./UserAvatar.jsx";
import UserLink from "./UserLink.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";
import useLikeToggle from "../lib/useLikeToggle.js";

export default function PostModal({
  postId,
  onClose,
  onDeleted,
  onEdit,
  allowMobile = false,
  focusCommentId = null,
}) {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [stats, setStats] = useState({ likes: 0, liked: false });
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const commentInputRef = useRef(null);
  const likesCount =
    post?.likesCount ?? post?.likes?.length ?? stats.likes ?? 0;
  const commentsCount =
    post?.commentsCount ?? commentsTotal ?? comments.length ?? 0;
  const ownerId =
    post?.authorId?._id ||
    post?.authorId ||
    post?.userId?._id ||
    post?.userId ||
    post?.ownerId;
  const isOwner = ownerId && user?._id && String(ownerId) === String(user._id);

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
        const data = await request(
          `/posts/${postId}/comments?limit=${DEFAULT_LIMIT}`,
        );
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

  useEffect(() => {
    if (!postId || isDesktop) return;
    window.dispatchEvent(new CustomEvent("mobile-viewer:open"));
    return () => {
      window.dispatchEvent(new CustomEvent("mobile-viewer:close"));
    };
  }, [postId, isDesktop]);

  const { toggle: handleToggleLike, loading: likeLoading } = useLikeToggle(postId, {
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
        const nextComment = {
          ...data.comment,
          likesCount:
            typeof data.comment.likesCount === "number"
              ? data.comment.likesCount
              : 0,
          likedByMe: Boolean(data.comment.likedByMe),
        };
        setComments((prev) => [nextComment, ...prev]);
        setCommentsTotal((prev) => prev + 1);
        setCommentText("");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("notifications:changed"));
        }
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

  function handleReply(username) {
    if (!username) return;
    const mention = `@${username} `;
    setCommentText((prev) => (prev.startsWith(mention) ? prev : mention));
    requestAnimationFrame(() => {
      commentInputRef.current?.focus();
    });
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

  function getCommentMeta(comment) {
    const likesCount =
      typeof comment.likesCount === "number"
        ? comment.likesCount
        : Array.isArray(comment.likes)
          ? comment.likes.length
          : 0;
    const likedByMe =
      typeof comment.likedByMe === "boolean"
        ? comment.likedByMe
        : Array.isArray(comment.likes) && user?._id
          ? comment.likes.some((id) => String(id) === String(user._id))
          : false;
    return { likesCount, likedByMe };
  }

  async function handleToggleCommentLike(commentId) {
    if (!commentId) return;
    const snapshot = comments;
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id !== commentId) return comment;
        const { likesCount, likedByMe } = getCommentMeta(comment);
        return {
          ...comment,
          likesCount: Math.max(0, likesCount + (likedByMe ? -1 : 1)),
          likedByMe: !likedByMe,
        };
      }),
    );

    try {
      const data = await request(`/comments/${commentId}/like`, {
        method: "POST",
      });
      if (data?.comment) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  ...data.comment,
                  likesCount:
                    typeof data.comment.likesCount === "number"
                      ? data.comment.likesCount
                      : comment.likesCount,
                  likedByMe:
                    typeof data.comment.likedByMe === "boolean"
                      ? data.comment.likedByMe
                      : comment.likedByMe,
                }
              : comment,
          ),
        );
      }
    } catch (err) {
      setComments(snapshot);
      setError(err.message || "Unable to like the comment.");
    }
  }

  const commentsRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!actionsOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setActionsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [actionsOpen]);

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
      {!isDesktop ? (
        <ModalWindow preset="post" zClass="z-[91]" fullScreen>
          <div className="flex h-full w-full flex-col bg-white text-[#262626]">
            <div className="flex h-[56px] items-center justify-between border-b border-[#DBDBDB] px-4">
              <button
                type="button"
                onClick={() => onClose?.()}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EFEFEF] active:bg-[#DBDBDB]"
                aria-label="Back"
              >
                <img src="/images/Back.svg" alt="Back" className="h-5 w-5" />
              </button>
              <UserLink
                userId={ownerId}
                className="text-[14px] font-semibold"
                ariaLabel="Open profile"
                stopPropagation={false}
              >
                {post?.authorId?.username || "Post"}
              </UserLink>
              <button
                type="button"
                onClick={() => setActionsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#EFEFEF] active:bg-[#DBDBDB]"
                aria-label="More options"
              >
                <span className="text-[22px] font-semibold leading-none">
                  ...
                </span>
              </button>
            </div>

            <div className="flex-1 bg-white">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-[#8E8E8E]">
                  Loading...
                </div>
              ) : post?.image ? (
                <img
                  src={post.image}
                  alt={post.caption || "post"}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#8E8E8E]">
                  No image
                </div>
              )}
            </div>

            <div className="border-t border-[#DBDBDB] px-4 py-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={likeLoading}
                  className="inline-flex items-center gap-1 disabled:opacity-60"
                  aria-label="Like"
                >
                  <img
                    src={
                      stats.liked
                        ? "/images/Like_active.svg"
                        : "/images/Like.svg"
                    }
                    alt="Like"
                    className="h-6 w-6"
                  />
                  {likesCount > 0 ? (
                    <span className="text-[14px] text-[#262626]">
                      {likesCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("comments:open", { detail: postId }),
                    );
                  }}
                  aria-label="Comments"
                  className="inline-flex items-center gap-1"
                >
                  <img
                    src="/images/Comment.svg"
                    alt="Comment"
                    className="h-6 w-6"
                  />
                  {commentsCount > 0 ? (
                    <span className="text-[14px] text-[#262626]">
                      {commentsCount}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </ModalWindow>
      ) : (
        <ModalWindow preset="post" zClass="z-[91]" fullScreen={!isDesktop}>
          <div className="relative h-full w-full overflow-hidden text-[#262626]">
            <div className="relative flex h-full w-full flex-col md:flex-row">
              <div className="h-[40vh] md:h-auto md:flex-1 bg-white shrink-0">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#8E8E8E]">
                    Loading...
                  </div>
                ) : post?.image ? (
                  <img
                    src={post.image}
                    alt={post.caption || "post"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#8E8E8E]">
                    No image
                  </div>
                )}
              </div>

              <div className="flex w-full md:w-[424px] flex-col border-l border-[#DBDBDB] min-h-0 shrink-0">
                <div className="flex items-center gap-3 border-b border-[#DBDBDB] px-5 py-4">
                  <UserLink
                    userId={ownerId}
                    className="flex items-center gap-3"
                    ariaLabel="Open profile"
                    stopPropagation={false}
                  >
                    <UserAvatar user={post?.authorId} size={36} />
                    <div className="text-sm font-semibold">
                      {post?.authorId?.username || "user"}
                    </div>
                  </UserLink>
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => setActionsOpen(true)}
                      className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-[#262626] hover:bg-[#EFEFEF] active:bg-[#DBDBDB]"
                      aria-label="More options"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  ) : null}
                </div>

                <div
                  ref={commentsRef}
                  className="flex-1 space-y-4 overflow-auto px-5 py-4"
                >
                  {post?.caption ? (
                    <div className="flex gap-3">
                      <UserLink
                        userId={ownerId}
                        className="h-9 w-9"
                        ariaLabel="Open profile"
                        stopPropagation={false}
                      >
                        <UserAvatar user={post?.authorId} size={36} />
                      </UserLink>
                      <div className="text-sm text-[#262626]">
                        <UserLink
                          userId={ownerId}
                          className="font-semibold"
                          ariaLabel="Open profile"
                          stopPropagation={false}
                        >
                          {post?.authorId?.username || "user"}
                        </UserLink>{" "}
                        {post.caption}
                      </div>
                    </div>
                  ) : null}

                  {commentError ? (
                    <div className="text-xs text-red-500">{commentError}</div>
                  ) : null}

                  {comments.map((comment) => {
                    const { likesCount, likedByMe } = getCommentMeta(comment);
                    return (
                      <div
                        key={comment._id}
                        data-comment-id={comment._id}
                        className="flex items-start gap-3"
                      >
                        <UserLink
                          userId={comment.userId?._id || comment.userId}
                          className="h-9 w-9"
                          ariaLabel="Open profile"
                          stopPropagation={false}
                        >
                          <UserAvatar user={comment.userId} size={36} />
                        </UserLink>
                        <div className="flex-1">
                          <div className="text-sm text-[#262626]">
                            <UserLink
                              userId={comment.userId?._id || comment.userId}
                              className="font-semibold"
                              ariaLabel="Open profile"
                              stopPropagation={false}
                            >
                              {comment.userId?.username || "user"}
                            </UserLink>{" "}
                            {comment.text}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-[#8E8E8E]">
                            {likesCount > 0 ? (
                              <span>
                                {likesCount === 1
                                  ? "1 like"
                                  : `${likesCount} likes`}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                handleReply(comment.userId?.username || "")
                              }
                              className="text-[#8E8E8E]"
                              aria-label="Reply to comment"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCommentLike(comment._id)}
                          className="inline-flex items-center justify-center"
                          aria-label="Like comment"
                        >
                          <img
                            src={
                              likedByMe
                                ? "/images/Like_active-red.svg"
                                : "/images/Like.svg"
                            }
                            alt="Like"
                            className="h-[10px] w-[10px]"
                          />
                        </button>
                      </div>
                    );
                  })}
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
                      className="inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      <img
                        src={
                          stats.liked
                            ? "/images/Like_active.svg"
                            : "/images/Like.svg"
                        }
                        alt="Like"
                        className="h-6 w-6 cursor-pointer"
                      />
                      {likesCount > 0 ? (
                        <span className="text-[14px] text-[#262626]">
                          {likesCount}
                        </span>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("comments:open", { detail: postId }),
                        );
                      }}
                      className="inline-flex items-center gap-1"
                      aria-label="Comments"
                    >
                      <img
                        src="/images/Comment.svg"
                        alt="Comment"
                        className="h-6 w-6 cursor-pointer"
                      />
                      {commentsCount > 0 ? (
                        <span className="text-[14px] text-[#262626]">
                          {commentsCount}
                        </span>
                      ) : null}
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleAddComment}
                  className="relative z-[1] border-t border-[#DBDBDB] px-5 py-3 pointer-events-auto"
                >
                  <div className="flex items-center gap-3 pointer-events-auto">
                    <img src="/images/Smile.svg" alt="Emoji" />
                    <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-4 text-sm text-[#262626] pointer-events-auto">
                      <input
                        ref={commentInputRef}
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
      )}

      {actionsOpen ? (
        <div
          className="fixed inset-0 z-[200]"
          onClick={() => setActionsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-[201] flex h-full w-full items-center justify-center">
            <div
              ref={actionsRef}
              className="w-[360px] max-w-[90vw] overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {isOwner ? (
                <>
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
                </>
              ) : null}
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
        </div>
      ) : null}
    </ModalStackRoot>
  );
}
