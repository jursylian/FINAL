import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserLink({
  userId,
  className = "",
  children,
  ariaLabel = "Open profile",
  stopPropagation = true,
}) {
  const navigate = useNavigate();

  if (!userId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        if (stopPropagation) event.stopPropagation();
        navigate(`/profile/${userId}`);
      }}
      className={["cursor-pointer", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
