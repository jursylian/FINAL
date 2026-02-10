import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import UserLink from "./UserLink.jsx";
import UserAvatar from "./UserAvatar.jsx";

function buildText(item) {
  if (item.type === "like") return "liked your post";
  if (item.type === "comment") return "commented on your post";
  if (item.type === "follow") return "started following you";
  if (item.type === "like_comment") return "liked your comment";
  return "did something";
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

  async function handleMarkRead(id) {
    const snapshot = itemsRef.current;
    setItems((prev) => prev.filter((item) => item._id !== id));
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

  function openPost(postId, commentId) {
    if (!postId) return;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("post:open", { detail: { postId, commentId } }),
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((notification) => (
        <div key={notification._id} className="flex items-center gap-3">
          <UserLink
            userId={notification.actorId?._id || notification.actorId}
            ariaLabel="Open profile"
          >
            <UserAvatar user={notification.actorId} size={32} />
          </UserLink>
          <div className="flex-1">
            <div className="text-[13px] text-[#262626]">
              <UserLink
                userId={notification.actorId?._id || notification.actorId}
                className="font-semibold"
                ariaLabel="Open profile"
              >
                {notification.actorId?.username || "user"}
              </UserLink>{" "}
              {notification.type === "follow" ? (
                <button
                  type="button"
                  onClick={() => {
                    const actorId = notification.actorId?._id;
                    if (actorId) {
                      navigate(`/profile/${actorId}`);
                    }
                  }}
                  className="text-left cursor-pointer transition hover:opacity-70"
                >
                  {buildText(notification)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const postId = notification.postId || notification.entityId;
                    const commentId = notification.commentId || null;
                    openPost(postId, commentId);
                  }}
                  className="text-left cursor-pointer transition hover:opacity-70"
                >
                  {buildText(notification)}
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleMarkRead(notification._id)}
            className="text-[11px] text-[#0095F6]"
          >
            Mark read
          </button>
        </div>
      ))}
    </div>
  );
}
