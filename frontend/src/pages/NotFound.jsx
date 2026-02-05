import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#262626]">
      <div className="flex min-h-[calc(100vh-70px)]">
        <aside className="hidden md:block w-[245px] border-r border-[#EFEFEF] bg-white">
          <div className="flex h-full flex-col px-6 py-6">
            <img
              src="/images/Logo.svg"
              alt="Logo"
              className="h-auto w-[97px]"
            />

            <nav className="mt-10 flex flex-col gap-4 text-[13px] text-[#262626]">
              <div className="flex items-center gap-3">
                <img src="/images/Home.svg" className="h-5 w-5" />
                Home
              </div>
              <div className="flex items-center gap-3">
                <img src="/images/Search.svg" className="h-5 w-5" />
                Search
              </div>
              <div className="flex items-center gap-3">
                <img src="/images/Explore.svg" className="h-5 w-5" />
                Explore
              </div>
              <div className="flex items-center gap-3">
                <img src="/images/Messages.svg" className="h-5 w-5" />
                Messages
              </div>
              <div className="flex items-center gap-3">
                <img src="/images/Like.svg" className="h-5 w-5" />
                Notifications
              </div>
              <div className="flex items-center gap-3">
                <img src="/images/Add.svg" className="h-5 w-5" />
                Create
              </div>
            </nav>

            <div className="mt-10 flex items-center gap-3 text-[13px] text-[#262626]">
              <img src="/images/ICH.svg" className="h-6 w-6 rounded-full" />
              Profile
            </div>
          </div>
        </aside>

        <main className="flex flex-1 items-center justify-center px-10">
          <div className="flex  items-center gap-10">
            <img
              src="/images/Hero.png"
              alt="Preview"
              className="hidden md:block h-[460px] w-[301px] object-contain"
            />
            <div>
              <h1
                className="text-[36px] font-bold leading-[20px] text-[#262626]"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Oops! Page Not Found (404 Error)
              </h1>
              <p
                className="mt-2 max-w-[360px] text-[16px] font-semibold leading-[20px] text-[#737373]"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                We&apos;re sorry, but the page you&apos;re looking for
                doesn&apos;t seem to exist. If you typed the URL manually,
                please double-check the spelling. If you clicked on a link, it
                may be outdated or broken.
              </p>
            </div>
          </div>
        </main>
      </div>

      <footer className="border-t border-[#EFEFEF] bg-white">
        <div className="flex h-[44px] items-center justify-center gap-8 text-[11px] text-[#737373]">
          <span>Home</span>
          <span>Search</span>
          <span>Explore</span>
          <span>Messages</span>
          <span>Notifications</span>
          <span>Create</span>
        </div>
        <div className="pb-3 text-center text-[11px] text-[#737373]">
          © 2024 ICHgram
        </div>
      </footer>
    </div>
  );
}
