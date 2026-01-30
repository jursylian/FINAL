import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import FeedPost from "../components/FeedPost.jsx";
import PostModal from "../components/PostModal.jsx";
import NotificationsList from "../components/NotificationsList.jsx";

const SIDEBAR_W = 245;
const PANEL_W = 397;
const OVERLAY_LEFT = SIDEBAR_W + PANEL_W; // 642

export default function Feed() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoadingIds, setLikeLoadingIds] = useState(new Set());
  const [modalPostId, setModalPostId] = useState(null);

  // null | "search" | "notifications"
  const [panel, setPanel] = useState(null);
  const panelOpen = panel !== null;

  useEffect(() => {
    let mounted = true;

    async function loadFeed() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/posts?limit=50");
        if (mounted) setItems(data.items || []);
      } catch (err) {
        if (mounted) setError(err.message || "Не удалось загрузить ленту.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadFeed();
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    const nextPanel = location.state?.panel;
    if (nextPanel === "search" || nextPanel === "notifications") {
      setPanel(nextPanel);
      navigate(".", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  function setLikeLoading(postId, value) {
    setLikeLoadingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(postId);
      else next.delete(postId);
      return next;
    });
  }

  async function handleToggleLike(postId) {
    if (!postId || likeLoadingIds.has(postId)) {
      return;
    }
    setError(null);
    setLikeLoading(postId, true);
    try {
      const data = await request(`/posts/${postId}/like`, { method: "POST" });
      setItems((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                liked: Boolean(data.liked),
                likesCount:
                  typeof data.likesCount === "number"
                    ? data.likesCount
                    : post.likesCount,
              }
            : post,
        ),
      );
    } catch (err) {
      setError(err.message || "Не удалось поставить лайк.");
    } finally {
      setLikeLoading(postId, false);
    }
  }

  function handleOpenComments(postId) {
    setModalPostId(postId);
  }

  function handleCloseModal() {
    setModalPostId(null);
  }

  function togglePanel(type) {
    setPanel((prev) => (prev === type ? null : type));
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* OVERLAY */}
      <div
        onClick={() => setPanel(null)}
        className={[
          "fixed inset-0 z-30 bg-[#000000A6]",
          "transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          panelOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <div className="flex">
        <Sidebar
          user={user}
          onLogout={logout}
          homeActive={panel === null}
          searchActive={panel === "search"}
          notifActive={panel === "notifications"}
          onHome={() => setPanel(null)}
          onToggleSearch={() => togglePanel("search")}
          onToggleNotifications={() => togglePanel("notifications")}
        />

        <LeftPanelFixed open={panelOpen} title={panel}>
          {panel === "search" && <SearchPanel />}
          {panel === "notifications" && <NotificationsList />}
        </LeftPanelFixed>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[980px] px-10 py-10 pb-[140px]">
            {loading && (
              <div className="text-[14px] text-[#737373]">Loading...</div>
            )}

            {error && (
              <div className="border border-[#DBDBDB] bg-white p-3 text-[14px] text-red-500">
                {error}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-x-[60px] gap-y-[70px] lg:grid-cols-2">
              {items.map((post) => (
                <FeedPost
                  key={post._id}
                  post={post}
                  likeLoading={likeLoadingIds.has(post._id)}
                  onToggleLike={handleToggleLike}
                  onOpenComments={handleOpenComments}
                />
              ))}
            </div>

            <div className="mt-24 flex flex-col items-center gap-3">
              <img src="/images/Done.svg" alt="Done" className="h-23 w-23" />
              <div className="text-center">
                <div className="text-[14px] font-semibold text-[#262626]">
                  You have seen all the updates
                </div>
                <div className="text-[14px] text-[#8E8E8E]">
                  You have viewed all new publications
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <FooterNav
        onHome={() => setPanel(null)}
        onSearch={() => togglePanel("search")}
        onExplore={() => navigate("/explore")}
        onMessages={() => {}}
        onNotifications={() => togglePanel("notifications")}
        onCreate={() => navigate("/posts/new")}
      />

      {modalPostId ? (
        <PostModal postId={modalPostId} onClose={handleCloseModal} />
      ) : null}
    </div>
  );
}

/* ================= SIDEBAR ================= */

function Sidebar({
  user,
  onLogout,
  homeActive,
  searchActive,
  notifActive,
  onHome,
  onToggleSearch,
  onToggleNotifications,
}) {
  const iconClass = "h-6 w-6 shrink-0";
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

          <Link to="/explore" className={rowClass}>
            <img src="/images/Explore.svg" className={iconClass} />
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

          <Link to="/posts/new" className={rowClass}>
            <img src="/images/Add.svg" className={iconClass} />
            <span className={labelClass}>Create</span>
          </Link>

          {user?._id && (
            <Link to={`/profile/${user._id}`} className={rowClass}>
              <div className="h-6 w-6 overflow-hidden rounded-full bg-[#DBDBDB]">
                <img
                  src="/images/ICH.svg"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className={labelClass}>Profile</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto" />
      </div>
    </aside>
  );
}

/* ================= PANEL ================= */

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
        "fixed top-0 left-[245px] z-40 h-screen w-[397px]",
        "bg-white overflow-hidden",
        "rounded-tr-[16px] rounded-br-[16px]",

        // 🌫 ТЕНЬ НА КОНТЕНТ (слева)
        "shadow-[-12px_0_40px_rgba(0,0,0,0.18)]",

        // 🌫 ЛЁГКАЯ ТЕНЬ НА САЙДБАР (справа)
        "after:absolute after:top-0 after:right-full after:h-full after:w-[12px]",
        "after:bg-gradient-to-l after:from-black/10 after:to-transparent after:pointer-events-none",

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

/* ================= PANELS CONTENT ================= */

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
        setError(err.message || "Не удалось выполнить поиск.");
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

/* ================= FOOTER ================= */

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
      <div className="h-px w-full bg-[#DBDBDB]" />
      <div className="flex h-[44px] items-center justify-center gap-8 px-6">
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
        <button onClick={onNotifications} className={linkClass}>
          Notifications
        </button>
        <button onClick={onCreate} className={linkClass}>
          Create
        </button>
      </div>
      <div className="pb-3 text-center text-[12px] text-[#737373]">
        © 2024 ICHgram
      </div>
    </footer>
  );
}
