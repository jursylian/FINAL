import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar({
  user,
  onLogout,
  homeActive,
  searchActive,
  notifActive,
  onHome,
  onToggleSearch,
  onToggleNotifications,
  onCreate,
  onNavigate,
  exploreActive,
}) {
  const iconClass = "h-6 w-6 shrink-0 cursor-pointer";
  const rowClass = "flex items-center gap-3";
  const labelClass = "text-[14px] text-[#262626]";

  return (
    <aside className="sticky top-0 z-50 h-screen w-[245px] border-r border-[#DBDBDB] bg-white">
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
            <img src={exploreActive ? "/images/Explore_active.svg" : "/images/Explore.svg"} className={iconClass} />
            <span className={labelClass}>Explore</span>
          </Link>

          <div className={rowClass}>
            <img src="/images/Messages.svg" className={iconClass} />
            <span className={labelClass}>Messages</span>
          </div>

          <button onClick={onToggleNotifications} className={rowClass}>
            <img
              src={notifActive ? "/images/Like_active.svg" : "/images/Like.svg"}
              className={iconClass}
            />
            <span className={labelClass}>Notifications</span>
          </button>

          <button onClick={onCreate} className={rowClass}>
            <img src="/images/Add.svg" className={iconClass} />
            <span className={labelClass}>Create</span>
          </button>

          {user?._id && (
            <Link
              to={`/profile/${user._id}`}
              className={`${rowClass} mt-6 md:mt-12`}
              onClick={onNavigate}
            >
              <div className="h-6 w-6 overflow-hidden rounded-full bg-[#DBDBDB]">
                <img
                  src="/images/ICH.svg"
                  className="h-full w-full object-cover cursor-pointer"
                />
              </div>
              <span className={labelClass}>Profile</span>
            </Link>
          )}

          <button onClick={onLogout} className={rowClass}>
            <img src="/images/Logout.svg" className={iconClass} />
            <span className={labelClass}>Log out</span>
          </button>
        </nav>

        <div className="mt-auto" />
      </div>
    </aside>
  );
}
