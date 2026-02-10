import React from "react";
import Footer from "../components/Footer.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#262626] flex flex-col">
      <div className="flex flex-1">
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
              <img src="/images/Profile.svg" className="h-5 w-5 rounded-full" />
              Profile
            </div>
          </div>
        </aside>

        <main className="flex flex-1 items-start justify-center px-5 md:px-6 md:pt-[72px] xl:pt-[94px]">
          <div className="flex flex-col items-start gap-10 md:flex-row md:items-start md:gap-12">
            <img
              src="/images/Hero.png"
              alt="Preview"
              className="h-[360px] w-[236px] md:h-[400px] md:w-[260px] xl:h-[460px] xl:w-[301px] object-contain"
            />
            <div className="mt-[47px] max-w-[625px] text-center md:mt-[32px] md:text-left xl:mt-[47px]">
              <h1
                className="max-w-[625px] whitespace-nowrap text-[36px] font-bold leading-[20px] tracking-[0px] text-[#262626]"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                Oops! Page Not Found (404 Error)
              </h1>
              <div
                className="mt-4 max-w-[475px] space-y-0 text-[16px] font-medium leading-[20px] tracking-[0px] text-[#6B6B6B]"
                style={{ fontFamily: "Roboto, sans-serif" }}
              >
                <p>
                  We’re sorry, but the page you’re looking for doesn’t seem to
                  exist.
                </p>
                <p>
                  If you typed the URL manually, please double-check the
                  spelling.
                </p>
                <p>If you clicked on a link, it may be outdated or broken.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}


