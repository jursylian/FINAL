import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import { useAuth } from "../auth/AuthContext.jsx";
import PostCreateModal from "../components/PostCreateModal.jsx";
import PostModal from "../components/PostModal.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";

export default function Profile() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const isDesktop = useIsDesktop();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    isFollowing: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsError, setPostsError] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [modalPostId, setModalPostId] = useState(null);

  const isOwner = useMemo(
    () => me && profile && String(me._id) === String(profile._id),
    [me, profile],
  );

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await request(`/users/${id}`);
        if (mounted) {
          setProfile(data.user);
          if (data.stats) {
            setStats({
              posts: data.stats.posts || 0,
              followers: data.stats.followers || 0,
              following: data.stats.following || 0,
              isFollowing: Boolean(data.stats.isFollowing),
            });
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    async function loadPosts() {
      setPostsLoading(true);
      setPostsError(null);
      try {
        const data = await request(`/users/${id}/posts?limit=50`);
        if (mounted) {
          setPosts(data.items || []);
          setPostsTotal(typeof data.total === "number" ? data.total : 0);
        }
      } catch (err) {
        if (mounted) {
          setPostsError(err.message || "Failed to load posts.");
        }
      } finally {
        if (mounted) {
          setPostsLoading(false);
        }
      }
    }

    loadProfile();
    loadPosts();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    const shouldOpen = Boolean(location.state?.createOpen);
    if (shouldOpen && isOwner) {
      if (isDesktop) {
        setCreateOpen(true);
      } else {
        navigate("/posts/new");
      }
      navigate(".", { replace: true, state: null });
    }
  }, [isDesktop, isOwner, location.state, navigate]);

  useEffect(() => {
    function handleCreated(event) {
      const created = event.detail;
      if (!created?._id) return;
      const authorId =
        created.authorId?._id || created.authorId || created.userId?._id || created.userId;
      if (!authorId || !profile?._id) return;
      if (String(authorId) !== String(profile._id)) return;
      setPosts((prev) => {
        if (prev.some((post) => post._id === created._id)) return prev;
        return [created, ...prev];
      });
      setPostsTotal((prev) => prev + 1);
      setStats((prev) => ({ ...prev, posts: (prev.posts || 0) + 1 }));
    }
    window.addEventListener("post:created", handleCreated);
    return () => window.removeEventListener("post:created", handleCreated);
  }, [profile?._id]);

  async function handleToggleFollow() {
    if (followLoading || isOwner) {
      return;
    }
    setFollowLoading(true);
    try {
      const data = await request(`/users/${id}/follow`, { method: "POST" });
      setStats((prev) => ({
        ...prev,
        isFollowing: Boolean(data.following),
        followers:
          typeof data.followersCount === "number"
            ? data.followersCount
            : prev.followers,
        following:
          typeof data.followingCount === "number"
            ? data.followingCount
            : prev.following,
      }));
    } catch (err) {
      setError(err.message || "Failed to update follow.");
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-[935px] text-[14px] text-[#737373]">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-[935px] text-[14px] text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const postsCount = stats.posts || postsTotal || posts.length;

  return (
    <div className="px-4 py-8 pb-20 md:pb-8">
      <div className="mx-auto max-w-[935px]">
        <div className="flex flex-col md:flex-row gap-6 md:gap-[100px] border-b border-[#DBDBDB] pb-10">
          <div className="flex shrink-0 items-start justify-center w-full md:w-[290px]">
            <div className="h-[80px] w-[80px] md:h-[150px] md:w-[150px] overflow-hidden rounded-full bg-[#FAFAFA] border border-[#DBDBDB]">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[48px] text-[#DBDBDB]">
                  <img src="/images/ICH.svg" className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center gap-5 text-center md:items-start md:text-left">
            <div className="flex items-center gap-3 md:gap-5">
              <h1 className="text-[20px] font-normal text-[#262626]">
                {profile.username}
              </h1>

              {isOwner ? (
                <Link
                  to={`/profile/${profile._id}/edit`}
                  className="rounded-lg bg-[#EFEFEF] px-4 py-1.5 text-[14px] font-semibold text-[#262626] hover:bg-[#DBDBDB] transition"
                >
                  Edit profile
                </Link>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={[
                      "rounded-lg px-6 py-1.5 text-[14px] font-semibold transition",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      stats.isFollowing
                        ? "bg-[#EFEFEF] text-[#262626] hover:bg-[#DBDBDB]"
                        : "bg-[#0095F6] text-white hover:bg-[#1877F2]",
                    ].join(" ")}
                  >
                    {stats.isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-[#EFEFEF] px-6 py-1.5 text-[14px] font-semibold text-[#262626] hover:bg-[#DBDBDB] transition"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-10 text-[16px] text-[#262626] md:justify-start">
              <div>
                <span className="font-semibold">{postsCount}</span> posts
              </div>
              <Link to={`/profile/${profile._id}/followers`} className="hover:opacity-60 transition">
                <span className="font-semibold">{stats.followers}</span> followers
              </Link>
              <Link to={`/profile/${profile._id}/following`} className="hover:opacity-60 transition">
                <span className="font-semibold">{stats.following}</span> following
              </Link>
            </div>

            <div className="flex flex-col gap-1">
              {profile.name && (
                <div className="text-[14px] font-semibold text-[#262626]">
                  {profile.name}
                </div>
              )}
              {profile.bio && (
                <div className="text-[14px] text-[#262626] whitespace-pre-line">
                  {profile.bio}
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-[#00376B] hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          {postsLoading && (
            <div className="text-[14px] text-[#737373]">Loading posts...</div>
          )}
          {postsError && (
            <div className="text-[14px] text-red-500">{postsError}</div>
          )}
          {!postsLoading && !postsError && posts.length === 0 && (
            <div className="flex flex-col items-center py-16">
              <div className="text-[28px] font-light text-[#262626]">
                No Posts Yet
              </div>
            </div>
          )}
          <div className={["grid grid-cols-3 gap-1", modalPostId ? "opacity-60" : ""].join(" ")}>
            {posts.map((post) => (
              <button
                key={post._id}
                type="button"
                onClick={() => {
                  if (isDesktop) {
                    setModalPostId(post._id);
                  } else {
                    navigate(`/post/${post._id}`);
                  }
                }}
                className="group relative aspect-square overflow-hidden bg-[#FAFAFA]"
              >
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.caption || "post"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <div className="flex items-center gap-6 text-white font-semibold text-[14px]">
                    <span>Likes {post.likesCount || 0}</span>
                    <span>Comments {post.commentsCount || 0}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isDesktop && modalPostId ? (
        <PostModal
          postId={modalPostId}
          onClose={() => setModalPostId(null)}
          onDeleted={(id) => {
            setPosts((prev) => prev.filter((p) => p._id !== id));
            setPostsTotal((prev) => Math.max(prev - 1, 0));
            setStats((prev) => ({
              ...prev,
              posts: Math.max((prev.posts || 0) - 1, 0),
            }));
          }}
        />
      ) : null}

      {createOpen && isDesktop ? (
        <PostCreateModal
          onClose={() => setCreateOpen(false)}
          onCreated={(created) => {
            if (!created?._id) return;
            const authorId =
              created.authorId?._id || created.authorId || created.userId?._id || created.userId;
            if (!authorId || !profile?._id) return;
            if (String(authorId) !== String(profile._id)) return;
            setPosts((prev) => {
              if (prev.some((post) => post._id === created._id)) return prev;
              return [created, ...prev];
            });
            setPostsTotal((prev) => prev + 1);
            setStats((prev) => ({ ...prev, posts: (prev.posts || 0) + 1 }));
          }}
        />
      ) : null}
    </div>
  );
}
