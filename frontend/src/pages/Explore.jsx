import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { request } from "../lib/apiClient.js";
import PostModal from "../components/PostModal.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Explore() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalPostId, setModalPostId] = useState(null);

  const tileAreas = useMemo(
    () => ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
    [],
  );

  useEffect(() => {
    let mounted = true;
    async function loadExplore() {
      setLoading(true);
      setError(null);
      try {
        const data = await request("/explore/posts?limit=30");
        if (mounted) {
          setItems(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Не удалось загрузить Explore.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadExplore();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="flex">
        <aside className="sticky top-0 h-screen w-[245px] border-r border-[#DBDBDB] bg-white">
          <div className="flex h-full flex-col px-5 py-6">
            <div className="mb-10">
              <img
                src="/images/Logo.svg"
                alt="Logo"
                className="h-[55px] w-[97px]"
              />
            </div>

            <nav className="flex flex-col gap-4 text-[14px] text-[#262626]">
              <Link to="/" className="flex items-center gap-3">
                <img src="/images/Home.svg" className="h-6 w-6 shrink-0" />
                <span>Home</span>
              </Link>
              <button
                onClick={() => navigate("/", { state: { panel: "search" } })}
                className="flex items-center gap-3"
              >
                <img src="/images/Search.svg" className="h-6 w-6 shrink-0" />
                <span>Search</span>
              </button>
              <button
                onClick={() => navigate("/explore")}
                className="flex items-center gap-3 font-semibold"
              >
                <img
                  src="/images/Explore_active.svg"
                  className="h-6 w-6 shrink-0"
                />
                <span>Explore</span>
              </button>
              <div className="flex items-center gap-3">
                <img src="/images/Messages.svg" className="h-6 w-6 shrink-0" />
                <span>Messages</span>
              </div>
              <button
                onClick={() =>
                  navigate("/", { state: { panel: "notifications" } })
                }
                className="flex items-center gap-3"
              >
                <img src="/images/Like.svg" className="h-6 w-6 shrink-0" />
                <span>Notifications</span>
              </button>
              <Link to="/posts/new" className="flex items-center gap-3">
                <img src="/images/Add.svg" className="h-6 w-6 shrink-0" />
                <span>Create</span>
              </Link>

              {user?._id ? (
                <Link
                  to={`/profile/${user._id}`}
                  className="flex items-center gap-3"
                >
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-[#DBDBDB]">
                    <img
                      src="/images/ICH.svg"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span>Profile</span>
                </Link>
              ) : null}
            </nav>

            <div className="mt-auto" />
          </div>
        </aside>

        <main className="flex-1 px-10 py-10">
          <div className="mx-auto w-full max-w-[980px]">
            <Link
              className="text-sm font-semibold text-slate-900"
              to="/"
            ></Link>

            <div className="mt-6">
              {loading ? <div>Загрузка...</div> : null}
              {error ? (
                <div className="rounded-2xl bg-white p-4 text-rose-600">
                  {error}
                </div>
              ) : null}

              {!loading && !error && items.length === 0 ? (
                <div className="rounded-2xl bg-white p-4 text-slate-600">
                  Пока нет постов.
                </div>
              ) : null}

              <div
                className="mt-6 grid gap-4"
                style={{
                  gridTemplateColumns: "repeat(3, 316.989990234375px)",
                  gridAutoRows: "316.989990234375px",
                  gridTemplateAreas: '"a b c" "d e c" "f g h" "f i j"',
                }}
              >
                {items.map((post, index) => (
                  <button
                    key={post._id}
                    type="button"
                    onClick={() => setModalPostId(post._id)}
                    className="overflow-hidden bg-[#F2F2F2]"
                    style={
                      tileAreas[index]
                        ? { gridArea: tileAreas[index] }
                        : undefined
                    }
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.caption || "post"}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-[#DBDBDB] bg-white">
        <div className="flex h-[44px] items-center justify-center gap-8 px-6 text-[12px] text-[#737373]">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => navigate("/", { state: { panel: "search" } })}>
            Search
          </button>
          <button className="font-semibold text-[#262626]">Explore</button>
          <button>Messages</button>
          <button
            onClick={() => navigate("/", { state: { panel: "notifications" } })}
          >
            Notifications
          </button>
          <button onClick={() => navigate("/posts/new")}>Create</button>
        </div>
        <div className="pb-3 text-center text-[12px] text-[#737373]">
          © 2024 ICHgram
        </div>
      </footer>

      {modalPostId ? (
        <PostModal postId={modalPostId} onClose={() => setModalPostId(null)} />
      ) : null}
    </div>
  );
}


