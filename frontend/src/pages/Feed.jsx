import React, { useEffect, useState } from "react";
import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import FeedPost from "../components/FeedPost.jsx";
import PostModal from "../components/PostModal.jsx";
import PostCreateModal from "../components/PostCreateModal.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";
import { toggleLike } from "../lib/useLikeToggle.js";

export default function Feed() {
  const isDesktop = useIsDesktop();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoadingIds, setLikeLoadingIds] = useState(new Set());
  const [modalPostId, setModalPostId] = useState(null);
  const [editPost, setEditPost] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      setLoading(true);
      setError(null);
      if (!token) {
        if (mounted) {
          setItems([]);
          setLoading(false);
        }
        return;
      }
      try {
        const data = await request(`/posts?limit=${DEFAULT_LIMIT}`);
        if (mounted) setItems(data.items || []);
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load feed.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFeed();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    function handleCreated(event) {
      const created = event.detail;
      if (!created?._id) return;
      setItems((prev) => {
        if (prev.some((post) => post._id === created._id)) return prev;
        return [created, ...prev];
      });
    }
    window.addEventListener("post:created", handleCreated);
    return () => window.removeEventListener("post:created", handleCreated);
  }, []);

  function setLikeLoading(postId, value) {
    setLikeLoadingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  function handleOpenComments(id) {
    if (!id) return;
    if (isDesktop) {
      setModalPostId(id);
      return;
    }
    window.dispatchEvent(new CustomEvent("comments:open", { detail: id }));
  }

  function handleOpenPost(id) {
    if (!id) return;
    setModalPostId(id);
  }

  async function handleToggleLike(postId) {
    if (!postId || likeLoadingIds.has(postId)) return;
    setError(null);
    setLikeLoading(postId, true);
    try {
      const { liked, likesCount } = await toggleLike(postId);
      setItems((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, liked, likesCount: likesCount ?? p.likesCount }
            : p,
        ),
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications:changed"));
      }
    } catch (err) {
      setError(err.message || "Failed to like the post.");
    } finally {
      setLikeLoading(postId, false);
    }
  }

  return (
    <div className="w-full px-4 md:px-10 py-10 pb-[140px]">
      <div className="mx-auto w-full max-w-[980px] md:translate-x-[-122px]">
        {loading && (
          <div className="text-[14px] text-[#737373]">Loading...</div>
        )}

        {error && (
          <div className="border border-[#DBDBDB] bg-white p-3 text-[14px] text-red-500">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-x-[30px] gap-y-[22px] lg:grid-cols-2">
          {items.map((post) => (
            <FeedPost
              key={post._id}
              post={post}
              likeLoading={likeLoadingIds.has(post._id)}
              onToggleLike={handleToggleLike}
              onOpenComments={handleOpenComments}
              onOpenPost={handleOpenPost}
            />
          ))}
        </div>

        <div className="mt-24 flex flex-col items-center gap-3">
          <img src="/images/Done.svg" alt="Done" className="h-25 w-25" />
          <div className="text-center">
            <div className="text-[14px] font-semibold text-[#262626]">
              You've seen all the updates
            </div>
            <div className="text-[14px] text-[#8E8E8E]">
              You have viewed all new publications
            </div>
          </div>
        </div>
      </div>
      {modalPostId ? (
        <PostModal
          postId={modalPostId}
          allowMobile
          onClose={() => setModalPostId(null)}
          onDeleted={(id) =>
            setItems((prev) => prev.filter((p) => p._id !== id))
          }
          onEdit={(post) => setEditPost(post)}
        />
      ) : null}

      {isDesktop && editPost ? (
        <PostCreateModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onUpdated={(updated) => {
            setItems((prev) =>
              prev.map((p) =>
                p._id === updated._id ? { ...p, ...updated } : p,
              ),
            );
            setEditPost(null);
          }}
        />
      ) : null}
    </div>
  );
}
