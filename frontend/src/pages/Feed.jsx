import React, { useEffect, useState } from "react";
import { request } from "../lib/apiClient.js";
import FeedPost from "../components/FeedPost.jsx";
import PostModal from "../components/PostModal.jsx";

export default function Feed() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoadingIds, setLikeLoadingIds] = useState(new Set());
  const [modalPostId, setModalPostId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/posts?limit=50");
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
  }, []);

  function setLikeLoading(postId, value) {
    setLikeLoadingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  async function handleToggleLike(postId) {
    if (!postId || likeLoadingIds.has(postId)) {
      return;
    }
    setError(null);
    setLikeLoading(postId, true);
    try {
      const data = await request(`/posts/${postId}/like`, { method: "POST" });
      setItems((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked: Boolean(data.liked),
                likesCount:
                  typeof data.likesCount === "number"
                    ? data.likesCount
                    : post.likesCount,
              }
            : post,
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to like the post.");
    } finally {
      setLikeLoading(postId, false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[980px] px-10 py-10 pb-[140px]">
      {loading && (
        <div className="text-[14px] text-[#737373]">Loading...</div>
      )}

      {error && (
        <div className="border border-[#DBDBDB] bg-white p-3 text-[14px] text-red-500">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-x-[60px] gap-y-[70px] lg:grid-cols-2">
        {items.map((post) => (
          <FeedPost
            key={post._id}
            post={post}
            likeLoading={likeLoadingIds.has(post._id)}
            onToggleLike={handleToggleLike}
            onOpenComments={(id) => setModalPostId(id)}
          />
        ))}
      </div>

      <div className="mt-24 flex flex-col items-center gap-3">
        <img
          src="/images/Done.svg"
          alt="Done"
          className="h-23 w-23 cursor-pointer"
        />
        <div className="text-center">
          <div className="text-[14px] font-semibold text-[#262626]">
            You have seen all the updates
          </div>
          <div className="text-[14px] text-[#8E8E8E]">
            You have viewed all new publications
          </div>
        </div>
      </div>

      {modalPostId ? (
        <PostModal postId={modalPostId} onClose={() => setModalPostId(null)} />
      ) : null}
    </div>
  );
}
