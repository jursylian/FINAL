import React from "react";
import { useNavigate } from "react-router-dom";

import PostCreateContent from "../components/PostCreateContent.jsx";

export default function PostCreate() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-10 pb-24">
      <div className="mx-auto w-full max-w-[980px] rounded-2xl border border-[#DBDBDB] bg-white">
        <PostCreateContent showBack onClose={() => navigate(-1)} />
      </div>
    </div>
  );
}
