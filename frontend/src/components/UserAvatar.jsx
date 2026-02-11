import React from "react";

const DEFAULT_AVATAR = "/images/Default_pfp.svg";

export default function UserAvatar({ user, size = 36, className = "" }) {
  const avatar = user?.avatar || DEFAULT_AVATAR;

  return (
    <div
      className={[
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-[#FFFFFF]",
        className,
      ].join(" ")}
      style={{ width: size, height: size }}
    >
      <img
        src={avatar}
        alt={user?.username || "user"}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
