import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PostCreateContent from "../components/PostCreateContent.jsx";
import useIsDesktop from "../lib/useIsDesktop.js";

export default function PostCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!isDesktop) return;
    const from = location.state?.from || "/";
    navigate(from, { replace: true, state: { createOpen: true } });
  }, [isDesktop, location.state, navigate]);

  if (isDesktop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <PostCreateContent
        showBack
        autoOpenPicker
        pickerLabel="Select from gallery"
        onClose={() => navigate(-1)}
      />
    </div>
  );
}
