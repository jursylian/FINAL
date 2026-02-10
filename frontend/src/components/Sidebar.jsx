import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({
  user,
  onLogout,
  homeActive,
  searchActive,
  notifActive,
  notifCount = 0,
  onHome,
  onToggleSearch,
  onToggleNotifications,
  onCreate,
  onNavigate,
  exploreActive,
}) {
  const location = useLocation();
  const profileActive = location.pathname.startsWith("/profile");
  const iconClass = "h-6 w-6 shrink-0";
  const rowClass =
    "flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-[#F2F2F2] cursor-pointer";
  const labelClass = "text-[14px] text-[#262626] transition";
  const badgeText = notifCount > 99 ? "99+" : String(notifCount);
  const badgeIsPill = badgeText.length > 1;
  const badgeClass = badgeIsPill
    ? "min-w-[18px] h-[18px] px-1 text-[10px]"
    : "h-[18px] w-[18px] text-[11px]";

  return (
    <aside className="sticky top-0 z-50 h-screen md:h-[calc(100vh-158px)] w-[245px] border-r border-[#DBDBDB] bg-white overflow-hidden">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-10">
          <img
            src="/images/Logo.svg"
            alt="Logo"
            className="h-[55px] w-[97px]"
          />
        </div>

        <nav className="flex flex-col gap-4">
          <button onClick={onHome} className={rowClass}>
            <img
              src={homeActive ? "/images/Home_active.svg" : "/images/Home.svg"}
              className={iconClass}
            />
            <span className={labelClass}>Home</span>
          </button>

          <button onClick={onToggleSearch} className={rowClass}>
            <img
              src={
                searchActive
                  ? "/images/Search_active.svg"
                  : "/images/Search.svg"
              }
              className={iconClass}
            />
            <span className={labelClass}>Search</span>
          </button>

          <Link to="/explore" className={rowClass} onClick={onNavigate}>
            <img
              src={
                exploreActive
                  ? "/images/Explore_active.svg"
                  : "/images/Explore.svg"
              }
              className={iconClass}
            />
            <span className={labelClass}>Explore</span>
          </Link>

          <div className={rowClass} role="button" tabIndex={0}>
            <img src="/images/Messages.svg" className={iconClass} />
            <span className={labelClass}>Messages</span>
          </div>

          <button onClick={onToggleNotifications} className={rowClass}>
            <span className="relative">
              <img
                src={notifActive ? "/images/Like_active.svg" : "/images/Like.svg"}
                className={iconClass}
              />
              {notifCount > 0 ? (
                <span
                  className={[
                    "absolute -right-2 -top-2 flex items-center justify-center rounded-full",
                    "bg-[#EF4444] font-semibold text-white leading-none",
                    badgeClass,
                  ].join(" ")}
                >
                  {badgeText}
                </span>
              ) : null}
            </span>
            <span className={labelClass}>Notifications</span>
          </button>

          <button onClick={onCreate} className={rowClass}>
            <img src="/images/Add.svg" className={iconClass} />
            <span className={labelClass}>Create</span>
          </button>

          {user?._id && (
            <Link
              to={`/profile/${user._id}`}
              className={rowClass}
              onClick={onNavigate}
            >
              <div className="h-6 w-6 overflow-hidden rounded-full bg-[#DBDBDB]">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src="/images/ICH.svg"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span
                className={[
                  labelClass,
                  profileActive ? "font-semibold text-[#1f1f1f]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                Profile
              </span>
            </Link>
          )}

          <button
            onClick={onLogout}
            className={[rowClass, "hover:bg-transparent", "hover:[&>span]:text-[#1f1f1f]"].join(" ")}
          >
            <img src="/images/Logout.svg" className={iconClass} />
            <span className={labelClass}>Log out</span>
          </button>
        </nav>

        <div className="mt-auto" />
      </div>
    </aside>
  );
}
