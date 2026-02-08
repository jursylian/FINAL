import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import NotificationsList from "./NotificationsList.jsx";
import PostCreateModal from "./PostCreateModal.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";
import SearchPanel from "./SearchPanel.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  const [panel, setPanel] = useState(null);
  const panelOpen = panel !== null;
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === "/";
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const nextPanel = location.state?.panel;
    if (nextPanel === "search" || nextPanel === "notifications") {
      setPanel(nextPanel);
      navigate(".", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    setPanel(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isDesktop) {
      setPanel(null);
    }
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop && location.pathname === "/search") {
      navigate("/", { replace: true, state: { panel: "search" } });
    }
  }, [isDesktop, location.pathname, navigate]);

  useEffect(() => {
    if (isDesktop && location.pathname === "/notifications") {
      navigate("/", { replace: true, state: { panel: "notifications" } });
    }
  }, [isDesktop, location.pathname, navigate]);

  useEffect(() => {
    if (!user?._id) {
      setUnreadCount(0);
      return;
    }
    let mounted = true;
    async function loadCount() {
      try {
        const data = await request("/notifications/unread-count");
        if (mounted) {
          setUnreadCount(typeof data.count === "number" ? data.count : 0);
        }
      } catch (err) {
        if (mounted) setUnreadCount(0);
      }
    }
    loadCount();
    return () => {
      mounted = false;
    };
  }, [user?._id]);

  useEffect(() => {
    function handleDelta(event) {
      const delta = typeof event.detail === "number" ? event.detail : 0;
      setUnreadCount((prev) => Math.max(0, prev + delta));
    }
    window.addEventListener("notifications:unreadDelta", handleDelta);
    return () => {
      window.removeEventListener("notifications:unreadDelta", handleDelta);
    };
  }, []);

  function togglePanel(type) {
    if (!isDesktop && type === "notifications") {
      setPanel(null);
      navigate("/notifications");
      return;
    }
    if (!isDesktop && type === "search") {
      setPanel(null);
      navigate("/search");
      return;
    }
    setPanel((prev) => (prev === type ? null : type));
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div
        onClick={() => setPanel(null)}
        className={[
          "hidden md:block fixed inset-0 z-30 bg-[#000000A6]",
          "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <div className="flex">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[#DBDBDB] bg-white md:hidden"
        >
          <span className="sr-only">Open menu</span>
          <div className="flex flex-col items-center gap-1">
            <span className="h-[2px] w-4 bg-[#262626]" />
            <span className="h-[2px] w-4 bg-[#262626]" />
            <span className="h-[2px] w-4 bg-[#262626]" />
          </div>
        </button>

        <div
          onClick={() => setMobileMenuOpen(false)}
          className={[
            "fixed inset-0 z-40 bg-black/40 md:hidden",
            "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        />

        <div
          className={[
            "fixed inset-y-0 left-0 z-50 md:static",
            "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0",
          ].join(" ")}
        >
          <Sidebar
            user={user}
            onLogout={logout}
            homeActive={isHome && !panelOpen}
            searchActive={panel === "search"}
            notifActive={panel === "notifications"}
            notifCount={unreadCount}
            exploreActive={location.pathname === "/explore" && !panelOpen}
            onHome={() => {
              setPanel(null);
              setMobileMenuOpen(false);
              navigate("/");
            }}
            onToggleSearch={() => {
              togglePanel("search");
              setMobileMenuOpen(false);
            }}
            onToggleNotifications={() => {
              togglePanel("notifications");
              setMobileMenuOpen(false);
            }}
            onCreate={() => {
              if (isDesktop) {
                setCreateOpen(true);
              } else {
                navigate("/posts/new");
              }
              setMobileMenuOpen(false);
            }}
            onNavigate={() => {
              setPanel(null);
              setMobileMenuOpen(false);
            }}
          />
        </div>

        <LeftPanelFixed open={panelOpen} title={panel}>
          {panel === "search" && <SearchPanel />}
          {panel === "notifications" && <NotificationsList />}
        </LeftPanelFixed>

        <main className="flex-1 pb-[158px] md:pb-[158px] md:ml-[78px]">
          <Outlet />
        </main>
      </div>

      <FooterNav
        onHome={() => {
          setPanel(null);
          navigate("/");
        }}
        onSearch={() => togglePanel("search")}
        onExplore={() => {
          setPanel(null);
          navigate("/explore");
        }}
        onMessages={() => {}}
        onNotifications={() => togglePanel("notifications")}
        onCreate={() => {
          if (isDesktop) {
            setCreateOpen(true);
          } else {
            navigate("/posts/new");
          }
        }}
      />

      {createOpen && isDesktop ? (
        <PostCreateModal onClose={() => setCreateOpen(false)} />
      ) : null}
    </div>
  );
}

function LeftPanelFixed({ open, title, children }) {
  const header =
    title === "search"
      ? "Search"
      : title === "notifications"
        ? "Notifications"
        : "";

  return (
    <div
      className={[
        "hidden md:block fixed top-0 left-[245px] z-40 h-[calc(100vh-158px)] w-[397px]",
        "bg-white overflow-hidden",
        "rounded-tr-[16px] rounded-br-[16px]",
        "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      <div className="flex h-[60px] items-center border-b border-[#DBDBDB] px-4">
        <div className="text-[14px] font-semibold text-[#262626]">{header}</div>
      </div>
      <div className="h-[calc(100vh-60px)] overflow-auto p-4">{children}</div>
    </div>
  );
}

function FooterNav({
  onHome,
  onSearch,
  onExplore,
  onMessages,
  onNotifications,
  onCreate,
}) {
  const linkClass =
    "text-[12px] text-[#737373] hover:text-[#262626] transition";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white h-[158px]">
      <div className="flex flex-col items-center px-4 md:px-6 md:pb-6">
        <div className="flex h-[44px] w-full items-center justify-between md:w-auto md:gap-8">
          <button onClick={onHome} className={linkClass}>
            Home
          </button>
          <button onClick={onSearch} className={linkClass}>
            Search
          </button>
          <button onClick={onExplore} className={linkClass}>
            Explore
          </button>
          <button onClick={onMessages} className={linkClass}>
            Messages
          </button>
          <button onClick={onCreate} className={linkClass}>
            Create
          </button>
          <button onClick={onNotifications} className={linkClass}>
            Notifications
          </button>
        </div>
        <div className="mt-[45px] text-center text-[12px] text-[#737373]">
          © {new Date().getFullYear()} ICHgram
        </div>
      </div>
    </footer>
  );
}
