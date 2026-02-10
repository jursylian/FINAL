import React, { useEffect, useState, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Sidebar from "./Sidebar.jsx";
import NotificationsList from "./NotificationsList.jsx";
import PostModal from "./PostModal.jsx";
import PostCreateModal from "./PostCreateModal.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";
import SearchPanel from "./SearchPanel.jsx";
import { request } from "../lib/apiClient.js";
import { DEFAULT_LIMIT } from "../lib/constants.js";
import UserAvatar from "./UserAvatar.jsx";
import UserLink from "./UserLink.jsx";
import Footer from "./Footer.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  const [panel, setPanel] = useState(null);
  const panelOpen = panel !== null;
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileViewerOpen, setMobileViewerOpen] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [notifPostId, setNotifPostId] = useState(null);
  const [notifCommentId, setNotifCommentId] = useState(null);
  const commentInputRef = React.useRef(null);
  const isHome = location.pathname === "/";
  const isProfile = location.pathname.startsWith("/profile");
  const isNotifications = location.pathname.startsWith("/notifications");
  const isCreate =
    location.pathname === "/create" || location.pathname === "/posts/new";
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
    const shouldOpen = Boolean(location.state?.createOpen);
    if (!shouldOpen) return;
    if (isDesktop) {
      setCreateOpen(true);
    } else {
      navigate("/create", {
        replace: true,
        state: { from: location.pathname },
      });
    }
    navigate(".", { replace: true, state: null });
  }, [isDesktop, location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!createOpen || isDesktop) return;
    setCreateOpen(false);
    if (location.pathname !== "/create") {
      navigate("/create", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [createOpen, isDesktop, location.pathname, navigate]);

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

  const loadUnreadCount = useCallback(async () => {
    if (!user?._id) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await request("/notifications/unread-count");
      setUnreadCount(typeof data.count === "number" ? data.count : 0);
    } catch (err) {
      setUnreadCount(0);
    }
  }, [user?._id]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    function handleChanged() {
      loadUnreadCount();
    }
    window.addEventListener("notifications:changed", handleChanged);
    return () => {
      window.removeEventListener("notifications:changed", handleChanged);
    };
  }, [loadUnreadCount]);

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

  useEffect(() => {
    function handleOpen() {
      setMobileViewerOpen(true);
    }
    function handleClose() {
      setMobileViewerOpen(false);
    }
    window.addEventListener("mobile-viewer:open", handleOpen);
    window.addEventListener("mobile-viewer:close", handleClose);
    return () => {
      window.removeEventListener("mobile-viewer:open", handleOpen);
      window.removeEventListener("mobile-viewer:close", handleClose);
    };
  }, []);

  useEffect(() => {
    function handleOpen(event) {
      const detail = event?.detail || {};
      const postId = detail.postId;
      if (!postId) return;
      setPanel(null);
      setNotifPostId(postId);
      setNotifCommentId(detail.commentId || null);
    }
    function handleClose() {
      setNotifPostId(null);
      setNotifCommentId(null);
    }
    window.addEventListener("post:open", handleOpen);
    window.addEventListener("post:close", handleClose);
    return () => {
      window.removeEventListener("post:open", handleOpen);
      window.removeEventListener("post:close", handleClose);
    };
  }, []);

  useEffect(() => {
    function handleOpen(event) {
      if (isDesktop) return;
      const postId = event?.detail;
      if (!postId) return;
      setCommentsPostId(postId);
    }
    function handleClose() {
      setCommentsPostId(null);
      setCommentText("");
      setCommentError(null);
    }
    window.addEventListener("comments:open", handleOpen);
    window.addEventListener("comments:close", handleClose);
    return () => {
      window.removeEventListener("comments:open", handleOpen);
      window.removeEventListener("comments:close", handleClose);
    };
  }, [isDesktop]);

  useEffect(() => {
    async function loadComments() {
      if (!commentsPostId) return;
      setCommentsLoading(true);
      setCommentError(null);
      try {
        const data = await request(
          `/posts/${commentsPostId}/comments?limit=${DEFAULT_LIMIT}`,
        );
        setComments(data.items || []);
        setCommentsTotal(typeof data.total === "number" ? data.total : 0);
      } catch (err) {
        setCommentError(err.message || "Unable to load comments.");
      } finally {
        setCommentsLoading(false);
      }
    }
    if (commentsPostId) {
      loadComments();
    }
  }, [commentsPostId]);

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

  async function handleAddComment(event) {
    event.preventDefault();
    if (!commentsPostId || commentSending) return;
    const text = commentText.trim();
    if (!text) {
      setCommentError("Please enter a comment.");
      return;
    }
    setCommentError(null);
    setCommentSending(true);
    try {
      const data = await request(`/posts/${commentsPostId}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      if (data.comment) {
        const nextComment = {
          ...data.comment,
          likesCount:
            typeof data.comment.likesCount === "number"
              ? data.comment.likesCount
              : 0,
          likedByMe: Boolean(data.comment.likedByMe),
        };
        setComments((prev) => [nextComment, ...prev]);
        setCommentsTotal((prev) => prev + 1);
        setCommentText("");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("notifications:changed"));
        }
      }
    } catch (err) {
      setCommentError(err.message || "Unable to add a comment.");
    } finally {
      setCommentSending(false);
    }
  }

  function handleReply(username) {
    if (!username) return;
    const mention = `@${username} `;
    setCommentText((prev) => (prev.startsWith(mention) ? prev : mention));
    requestAnimationFrame(() => {
      commentInputRef.current?.focus();
    });
  }

  function getCommentMeta(comment) {
    const likesCount =
      typeof comment.likesCount === "number"
        ? comment.likesCount
        : Array.isArray(comment.likes)
          ? comment.likes.length
          : 0;
    const likedByMe =
      typeof comment.likedByMe === "boolean"
        ? comment.likedByMe
        : Array.isArray(comment.likes) && user?._id
          ? comment.likes.some((id) => String(id) === String(user._id))
          : false;
    return { likesCount, likedByMe };
  }

  async function handleToggleCommentLike(commentId) {
    if (!commentId) return;
    const snapshot = comments;
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id !== commentId) return comment;
        const { likesCount, likedByMe } = getCommentMeta(comment);
        return {
          ...comment,
          likesCount: Math.max(0, likesCount + (likedByMe ? -1 : 1)),
          likedByMe: !likedByMe,
        };
      }),
    );

    try {
      const data = await request(`/comments/${commentId}/like`, {
        method: "POST",
      });
      if (data?.comment) {
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  ...data.comment,
                  likesCount:
                    typeof data.comment.likesCount === "number"
                      ? data.comment.likesCount
                      : comment.likesCount,
                  likedByMe:
                    typeof data.comment.likedByMe === "boolean"
                      ? data.comment.likedByMe
                      : comment.likedByMe,
                }
              : comment,
          ),
        );
      }
    } catch (err) {
      setComments(snapshot);
    }
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
        <div className="hidden md:block fixed inset-y-0 left-0 z-50 md:static">
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
              navigate("/");
            }}
            onToggleSearch={() => {
              togglePanel("search");
            }}
            onToggleNotifications={() => {
              togglePanel("notifications");
            }}
            onCreate={() => {
              if (isDesktop) {
                setCreateOpen(true);
              } else {
                navigate("/create", { state: { from: location.pathname } });
              }
            }}
            onNavigate={() => {
              setPanel(null);
            }}
          />
        </div>

        <LeftPanelFixed open={panelOpen} title={panel}>
          {panel === "search" && <SearchPanel />}
          {panel === "notifications" && <NotificationsList />}
        </LeftPanelFixed>

        <main className="flex-1 pt-[56px] pb-[56px] sm:pt-0 sm:pb-[158px] md:ml-[78px]">
          <Outlet />
        </main>
      </div>

      {!mobileViewerOpen ? (
        <MobileTopBar
          notifCount={unreadCount}
          notificationsActive={isNotifications}
          createActive={isCreate || createOpen}
          onCreate={() => {
            if (isDesktop) {
              setCreateOpen(true);
            } else {
              navigate("/create", { state: { from: location.pathname } });
            }
          }}
          onNotifications={() => {
            if (isDesktop) {
              togglePanel("notifications");
            } else {
              navigate("/notifications");
            }
          }}
        />
      ) : null}

      {!mobileViewerOpen ? (
        <>
          <FooterNav
            homeActive={isHome && !panelOpen}
            searchActive={
              isDesktop ? panel === "search" : location.pathname === "/search"
            }
            exploreActive={location.pathname === "/explore" && !panelOpen}
            profileActive={isProfile}
            profileHref={user?._id ? `/profile/${user._id}` : "/"}
            profileAvatar={user?.avatar}
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
                navigate("/create", { state: { from: location.pathname } });
              }
            }}
          />
          <Footer
            className="hidden sm:block fixed bottom-0 left-0 right-0 z-40"
            items={[
              {
                label: "Home",
                onClick: () => {
                  setPanel(null);
                  navigate("/");
                },
              },
              {
                label: "Search",
                onClick: () => togglePanel("search"),
              },
              {
                label: "Explore",
                onClick: () => {
                  setPanel(null);
                  navigate("/explore");
                },
              },
              {
                label: "Messages",
                onClick: () => {},
              },
              {
                label: "Notifications",
                onClick: () => togglePanel("notifications"),
              },
              {
                label: "Create",
                onClick: () => {
                  if (isDesktop) {
                    setCreateOpen(true);
                  } else {
                    navigate("/create", { state: { from: location.pathname } });
                  }
                },
              },
            ]}
          />
        </>
      ) : null}

      {commentsPostId ? (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[9998] sm:hidden"
            onClick={() => setCommentsPostId(null)}
          />
          <div className="fixed left-0 right-0 bottom-0 h-[70vh] bg-white rounded-t-2xl z-[9999] overflow-hidden sm:hidden">
            <div className="flex h-[50px] items-center justify-between border-b border-[#DBDBDB] px-4">
              <button
                type="button"
                onClick={() => setCommentsPostId(null)}
                className="text-[14px] text-[#262626]"
              >
                Back
              </button>
              <div className="text-[14px] font-semibold">Comments</div>
              <div className="w-10" />
            </div>
            <div className="h-[calc(70vh-50px-64px)] overflow-auto px-4 py-3">
              {commentsLoading ? (
                <div className="text-xs text-[#8E8E8E]">Loading...</div>
              ) : null}
              {commentError ? (
                <div className="text-xs text-red-500">
                  {commentError || "Unable to load comments."}
                </div>
              ) : null}
              {!commentsLoading && !commentError && comments.length === 0 ? (
                <div className="text-xs text-[#8E8E8E]">No comments yet.</div>
              ) : null}
              {comments.map((comment) => {
                const { likesCount, likedByMe } = getCommentMeta(comment);
                return (
                  <div key={comment._id} className="flex items-start gap-3 py-2">
                    <UserLink
                      userId={comment.userId?._id || comment.userId}
                      className="h-8 w-8"
                      ariaLabel="Open profile"
                      stopPropagation={false}
                    >
                      <UserAvatar user={comment.userId} size={32} />
                    </UserLink>
                    <div className="flex-1">
                      <div className="text-sm text-[#262626]">
                        <UserLink
                          userId={comment.userId?._id || comment.userId}
                          className="font-semibold"
                          ariaLabel="Open profile"
                          stopPropagation={false}
                        >
                          {comment.userId?.username || "user"}
                        </UserLink>{" "}
                        {comment.text}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-[#8E8E8E]">
                        {likesCount > 0 ? (
                          <span>
                            {likesCount === 1
                              ? "1 like"
                              : `${likesCount} likes`}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          onClick={() =>
                            handleReply(comment.userId?.username || "")
                          }
                          className="text-[#8E8E8E]"
                          aria-label="Reply to comment"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleCommentLike(comment._id)}
                      className="inline-flex items-center justify-center"
                      aria-label="Like comment"
                    >
                      <img
                        src={
                          likedByMe
                            ? "/images/Like_active.svg"
                            : "/images/Like.svg"
                        }
                        alt="Like"
                        className="h-[10px] w-[10px]"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={handleAddComment}
              className="border-t border-[#DBDBDB] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <UserLink
                  userId={user?._id}
                  className="h-7 w-7"
                  ariaLabel="Open profile"
                  stopPropagation={false}
                >
                  <UserAvatar user={user} size={28} />
                </UserLink>
                <div className="flex h-10 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-4 text-sm text-[#262626]">
                  <input
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Add a comment..."
                    className="h-full w-full bg-transparent outline-none placeholder:text-[#8E8E8E]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={commentSending}
                  className="text-sm font-semibold text-[#0095F6] disabled:opacity-60"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}

      {createOpen && isDesktop ? (
        <PostCreateModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {notifPostId ? (
        <PostModal
          postId={notifPostId}
          focusCommentId={notifCommentId}
          allowMobile
          onClose={() => {
            setNotifPostId(null);
            setNotifCommentId(null);
            window.dispatchEvent(new Event("post:close"));
          }}
        />
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

function MobileIconButton({
  to,
  onClick,
  label,
  disabled = false,
  className = "",
  children,
}) {
  const baseClass = [
    "relative flex h-11 w-11 items-center justify-center rounded-full",
    "hover:bg-[#EFEFEF] active:bg-[#DBDBDB]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0095F6]/40",
    disabled ? "opacity-60" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={baseClass} aria-label={label}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClass}
      aria-label={label}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function MobileTopBar({
  onCreate,
  onNotifications,
  notifCount = 0,
  notificationsActive = false,
  createActive = false,
}) {
  const badgeText = notifCount > 99 ? "99+" : String(notifCount);
  const badgeIsPill = badgeText.length > 1;
  const badgeClass = badgeIsPill
    ? "min-w-[18px] h-[16px] px-1 text-[9px]"
    : "h-[16px] w-[16px] text-[10px]";

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[56px] border-b border-[#DBDBDB] bg-white sm:hidden">
      <div className="flex h-full items-center justify-between px-4">
        <MobileIconButton
          onClick={onCreate}
          label="Create"
          className={
            createActive
              ? "rounded-[10px] bg-[#262626] hover:bg-[#262626] active:bg-[#1f1f1f]"
              : ""
          }
        >
          <img
            src="/images/Add.svg"
            className={["h-6 w-6", createActive ? "invert" : ""].join(" ")}
          />
        </MobileIconButton>
        <div className="text-[14px] font-semibold text-[#262626]">ICHgram</div>
        <MobileIconButton onClick={onNotifications} label="Notifications">
          <img
            src={
              notificationsActive
                ? "/images/Like_active.svg"
                : "/images/Like.svg"
            }
            className="h-6 w-6"
          />
          {notifCount > 0 ? (
            <span
              className={[
                "absolute -right-1 -top-1 flex items-center justify-center rounded-full",
                "bg-[#EF4444] font-semibold text-white leading-none",
                badgeClass,
              ].join(" ")}
            >
              {badgeText}
            </span>
          ) : null}
        </MobileIconButton>
      </div>
    </div>
  );
}

function FooterNav({
  homeActive,
  searchActive,
  exploreActive,
  profileActive,
  profileHref,
  profileAvatar,
  onHome,
  onSearch,
  onExplore,
  onMessages,
  onNotifications,
  onCreate,
}) {
  const iconClass = "h-6 w-6 filter brightness-0";
  const iconActive = "opacity-100";
  const iconInactive = "opacity-100";

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 w-full bg-white h-[56px] sm:hidden">
      <div className="flex h-[56px] w-full items-center justify-between px-4">
        <MobileIconButton onClick={onHome} label="Home">
            <img
              src={homeActive ? "/images/Home_active.svg" : "/images/Home.svg"}
              className={[
                iconClass,
                homeActive ? iconActive : iconInactive,
              ].join(" ")}
            />
          </MobileIconButton>
          <MobileIconButton onClick={onSearch} label="Search">
            <img
              src={
                searchActive
                  ? "/images/Search_active.svg"
                  : "/images/Search.svg"
              }
              className={[
                iconClass,
                searchActive ? iconActive : iconInactive,
              ].join(" ")}
            />
          </MobileIconButton>
          <MobileIconButton onClick={onExplore} label="Explore">
            <img
              src={
                exploreActive
                  ? "/images/Explore_active.svg"
                  : "/images/Explore.svg"
              }
              className={[
                iconClass,
                exploreActive ? iconActive : iconInactive,
              ].join(" ")}
            />
          </MobileIconButton>
          <MobileIconButton onClick={onMessages} label="Messages">
            <img
              src="/images/Messages.svg"
              className={[iconClass, iconInactive].join(" ")}
            />
          </MobileIconButton>
          <MobileIconButton to={profileHref} label="Profile">
            <img
              src="/images/Profile.svg"
              className={[
                iconClass,
                "rounded-full",
                profileActive
                  ? "border-2 border-[#0095F6]"
                  : "border border-transparent",
              ].join(" ")}
            />
          </MobileIconButton>
      </div>
    </footer>
  );
}

