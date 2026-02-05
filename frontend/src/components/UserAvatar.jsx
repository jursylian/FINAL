import React from "react";

function getInitial(user) {
  const raw =
    String(user?.name || user?.username || "")
      .trim()
      .charAt(0)
      .toUpperCase() || "U";
  return raw;
}

export default function UserAvatar({ user, size = 36, className = "" }) {
  const initial = getInitial(user);
  const avatar = user?.avatar;
  const fontSize = Math.max(12, Math.round(size * 0.42));

  return (
    <div
      className={[
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-[#DBDBDB] text-[#8E8E8E]",
        className,
      ].join(" ")}
      style={{ width: size, height: size, fontSize }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={user?.username || "user"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold">{initial}</span>
      )}
    </div>
  );
}
