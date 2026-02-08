import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";

function buildText(item) {
  const name = item.actorId?.username || "user";
  if (item.type === "like") return `${name} liked your post`;
  if (item.type === "comment") return `${name} commented on your post`;
  if (item.type === "follow") return `${name} started following you`;
  return `${name} did something`;
}

export default function NotificationsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/notifications?unread=true");
        if (mounted) setItems(data.items || []);
      } catch (err) {
        if (mounted) setError(err.message || "Unable to load notifications.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function deleteNotification(id) {
    const snapshot = itemsRef.current;
    const next = snapshot.filter((item) => item._id !== id);
    setItems(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("notifications:unreadDelta", { detail: -1 }),
      );
    }

    try {
      await request(`/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      setItems(snapshot);
      const message = err.message || "Unable to delete notification.";
      setError(message);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("notifications:unreadDelta", { detail: 1 }),
        );
      }
      if (typeof window !== "undefined") {
        window.alert(message);
      }
    }
  }

  if (loading) {
    return <div className="text-[12px] text-[#8E8E8E]">Loading...</div>;
  }

  if (error) {
    return <div className="text-[12px] text-red-500">{error}</div>;
  }

  if (!items.length) {
    return (
      <div className="text-[12px] text-[#8E8E8E]">No notifications yet.</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((n) => (
        <div key={n._id} className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-[#DBDBDB]">
            <img
              src={n.actorId?.avatar || "/images/ICH.svg"}
              alt={n.actorId?.username || "user"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <button
              type="button"
              onClick={() => {
                if (n.type === "follow") {
                  const actorId = n.actorId?._id;
                  if (actorId) {
                    navigate(`/profile/${actorId}`);
                  }
                  return;
                }
                const ownerId = n.userId;
                const postId = n.postId || n.entityId;
                if (!ownerId || !postId) return;
                const commentId = n.commentId || (n.type === "comment" ? n.entityId : "");
                const search = new URLSearchParams();
                search.set("post", postId);
                if (commentId) search.set("comment", commentId);
                navigate(`/profile/${ownerId}?${search.toString()}`);
              }}
              className="text-left text-[13px] text-[#262626] cursor-pointer transition hover:opacity-70"
            >
              {buildText(n)}
            </button>
          </div>
          <button
            type="button"
            onClick={() => deleteNotification(n._id)}
            className="text-[11px] text-[#0095F6]"
          >
            Mark read
          </button>
        </div>
      ))}
    </div>
  );
}
