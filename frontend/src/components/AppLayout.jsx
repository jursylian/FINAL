import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { request } from "../lib/apiClient.js";
import Sidebar from "./Sidebar.jsx";
import NotificationsList from "./NotificationsList.jsx";
import PostCreateModal from "./PostCreateModal.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [panel, setPanel] = useState(null);
  const panelOpen = panel !== null;
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const nextPanel = location.state?.panel;
    if (nextPanel === "search" || nextPanel === "notifications") {
      setPanel(nextPanel);
      navigate(".", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  function togglePanel(type) {
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
            exploreActive={location.pathname === "/explore" && !panelOpen}
            onHome={() => { setPanel(null); setMobileMenuOpen(false); navigate("/"); }}
            onToggleSearch={() => { togglePanel("search"); setMobileMenuOpen(false); }}
            onToggleNotifications={() => { togglePanel("notifications"); setMobileMenuOpen(false); }}
            onCreate={() => { setCreateOpen(true); setMobileMenuOpen(false); }}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </div>

        <LeftPanelFixed open={panelOpen} title={panel}>
          {panel === "search" && <SearchPanel />}
          {panel === "notifications" && <NotificationsList />}
        </LeftPanelFixed>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <FooterNav
        onHome={() => { setPanel(null); navigate("/"); }}
        onSearch={() => togglePanel("search")}
        onExplore={() => { setPanel(null); navigate("/explore"); }}
        onMessages={() => {}}
        onNotifications={() => togglePanel("notifications")}
        onCreate={() => setCreateOpen(true)}
      />

      {createOpen ? (
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
        "hidden md:block fixed top-0 left-[245px] z-40 h-screen w-[397px]",
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

function SearchPanel() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setItems([]);
      setError(null);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await request(
          `/search/users?q=${encodeURIComponent(query)}`,
        );
        setItems(data.items || []);
      } catch (err) {
        setError(err.message || "Search failed.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="h-[40px] w-full rounded-[10px] border border-[#DBDBDB] bg-[#FAFAFA] px-3 text-[14px]"
      />
      {loading ? (
        <div className="mt-3 text-[12px] text-[#8E8E8E]">Searching...</div>
      ) : null}
      {error ? (
        <div className="mt-3 text-[12px] text-red-500">{error}</div>
      ) : null}
      <div className="mt-4 flex flex-col gap-3">
        {items.map((u) => (
          <Link
            key={u._id}
            to={`/profile/${u._id}`}
            className="flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-[#DBDBDB]" />
            <div>
              <div className="text-[13px] font-semibold text-[#262626]">
                {u.username}
              </div>
              <div className="text-[12px] text-[#8E8E8E]">{u.name || ""}</div>
            </div>
          </Link>
        ))}
      </div>
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
    <footer className="fixed bottom-0 left-0 z-50 w-full bg-white">
      <div className="flex h-[44px] items-center justify-between px-4 md:justify-center md:gap-8 md:px-6">
        <button onClick={onHome} className={linkClass}>Home</button>
        <button onClick={onSearch} className={linkClass}>Search</button>
        <button onClick={onExplore} className={linkClass}>Explore</button>
        <button onClick={onMessages} className={linkClass}>Messages</button>
        <button onClick={onNotifications} className={linkClass}>Notifications</button>
        <button onClick={onCreate} className={linkClass}>Create</button>
      </div>
      <div className="pb-3 text-center text-[12px] text-[#737373]">
        © 2024 ICHgram
      </div>
    </footer>
  );
}
