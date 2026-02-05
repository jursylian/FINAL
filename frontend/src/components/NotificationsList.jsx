import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { request } from "../lib/apiClient.js";

function buildText(item) {
  const name = item.actorId?.username || "user";
  if (item.type === "like") return `${name} liked your post`;
  if (item.type === "comment") return `${name} commented on your post`;
  if (item.type === "follow") return `${name} started following you`;
  return `${name} did something`;
}

function buildLink(item) {
  if (item.type === "follow") return `/profile/${item.actorId?._id || ""}`;
  if (item.type === "comment") return `/post/${item.entityId}`;
  if (item.type === "like") return `/post/${item.entityId}`;
  return "/";
}

export default function NotificationsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/notifications");
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

  async function markRead(id) {
    try {
      await request(`/notifications/${id}/read`, { method: "PATCH" });
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item)),
      );
    } catch (err) {
      setError(err.message || "Unable to mark as read.");
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
        <div
          key={n._id}
          className={`flex items-center gap-3 ${
            n.read ? "opacity-70" : ""
          }`}
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-[#DBDBDB]">
            <img
              src={n.actorId?.avatar || "/images/ICH.svg"}
              alt={n.actorId?.username || "user"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <Link to={buildLink(n)} className="text-[13px] text-[#262626]">
              {buildText(n)}
            </Link>
          </div>
          {!n.read ? (
            <button
              type="button"
              onClick={() => markRead(n._id)}
              className="text-[11px] text-[#0095F6]"
            >
              Mark read
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
