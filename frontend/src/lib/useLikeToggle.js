import { useState } from "react";
import { request } from "./apiClient.js";

export async function toggleLike(postId) {
  const data = await request(`/posts/${postId}/like`, { method: "POST" });
  return {
    liked: Boolean(data.liked),
    likesCount: typeof data.likesCount === "number" ? data.likesCount : null,
  };
}

export default function useLikeToggle(postId, { onUpdate, onError } = {}) {
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!postId || loading) return;
    setLoading(true);
    try {
      const data = await request(`/posts/${postId}/like`, { method: "POST" });
      onUpdate?.({
        liked: Boolean(data.liked),
        likesCount: typeof data.likesCount === "number" ? data.likesCount : null,
      });
    } catch (err) {
      onError?.(err.message || "Unable to like the post.");
    } finally {
      setLoading(false);
    }
  }

  return { toggle, loading };
}
