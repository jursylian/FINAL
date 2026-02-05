import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import PostModal from "../components/PostModal.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";

const TILE_AREAS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

export default function Explore() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPostId, setModalPostId] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadExplore() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/explore/posts?limit=30");
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load Explore.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadExplore();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="px-2 md:px-10 py-10 pb-20 md:pb-10">
      <div className="mx-auto w-full max-w-[980px]">
        <div className="mt-6">
          {loading ? <div className="text-[14px] text-[#737373]">Loading...</div> : null}
          {error ? (
            <div className="p-4 text-[14px] text-red-500">
              {error}
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <div className="p-4 text-[14px] text-[#737373]">
              No posts yet.
            </div>
          ) : null}

          <div
            className="mt-6 grid grid-cols-3 gap-1 md:gap-4"
            style={
              isDesktop
                ? {
                    gridAutoRows: "317px",
                    gridTemplateAreas: '"a b c" "d e c" "f g h" "f i j"',
                  }
                : undefined
            }
          >
            {items.map((post, index) => (
              <button
                key={post._id}
                type="button"
                onClick={() => {
                  if (isDesktop) {
                    setModalPostId(post._id);
                  } else {
                    navigate(`/post/${post._id}`);
                  }
                }}
                className="overflow-hidden bg-[#F2F2F2] aspect-square md:aspect-auto"
                style={
                  isDesktop && TILE_AREAS[index]
                    ? { gridArea: TILE_AREAS[index] }
                    : undefined
                }
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.caption || "post"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isDesktop && modalPostId ? (
        <PostModal
          postId={modalPostId}
          onClose={() => setModalPostId(null)}
          onDeleted={(id) => setItems((prev) => prev.filter((p) => p._id !== id))}
        />
      ) : null}
    </div>
  );
}
